/**
 * Cloudinary Media Pipeline Service for Lumora
 * Handles unsigned client-side uploads, progress tracking, transformations,
 * and graceful fallback handling.
 */

import { CloudinaryAsset } from '../types';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

const STORAGE_KEY_CLOUD_NAME = 'lumora_cloudinary_cloud_name';
const STORAGE_KEY_UPLOAD_PRESET = 'lumora_cloudinary_upload_preset';

/**
 * Retrieves the active Cloudinary configuration.
 * Checks environment variables first, then localStorage overrides.
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  const envCloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim().replace(/^['"]|['"]$/g, '');
  const envUploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim().replace(/^['"]|['"]$/g, '');

  let localCloudName = '';
  let localUploadPreset = '';

  if (typeof window !== 'undefined') {
    try {
      localCloudName = (localStorage.getItem(STORAGE_KEY_CLOUD_NAME) || '').trim().replace(/^['"]|['"]$/g, '');
      localUploadPreset = (localStorage.getItem(STORAGE_KEY_UPLOAD_PRESET) || '').trim().replace(/^['"]|['"]$/g, '');
    } catch (_) {}
  }

  return {
    cloudName: localCloudName || envCloudName,
    uploadPreset: localUploadPreset || envUploadPreset,
  };
}

/**
 * Saves or updates user Cloudinary settings into localStorage.
 */
export function setCloudinaryConfig(config: CloudinaryConfig): void {
  if (typeof window !== 'undefined') {
    try {
      if (config.cloudName) {
        localStorage.setItem(STORAGE_KEY_CLOUD_NAME, config.cloudName.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_CLOUD_NAME);
      }
      if (config.uploadPreset) {
        localStorage.setItem(STORAGE_KEY_UPLOAD_PRESET, config.uploadPreset.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_UPLOAD_PRESET);
      }
    } catch (_) {}
  }
}

/**
 * Checks whether Cloudinary credentials have been provided.
 */
export function isCloudinaryConfigured(): boolean {
  const config = getCloudinaryConfig();
  return Boolean(config.cloudName && config.uploadPreset);
}

export interface UploadOptions {
  file: File | Blob;
  filename?: string;
  onProgress?: (progressPercent: number) => void;
  config?: CloudinaryConfig;
}

/**
 * Uploads a file (photo or video) directly to Cloudinary using an unsigned upload preset.
 * Tracks upload progress via XMLHttpRequest.
 */
export function uploadToCloudinary(options: UploadOptions): Promise<CloudinaryAsset> {
  const { file, onProgress, config = getCloudinaryConfig() } = options;

  return new Promise((resolve, reject) => {
    const cloudName = (config.cloudName || '').trim();
    const uploadPreset = (config.uploadPreset || '').trim();

    // If Cloudinary is not configured, reject cleanly - never generate fake media in Live Mode
    if (!cloudName || !uploadPreset) {
      reject(
        new Error(
          'Cloudinary is not configured. Please ensure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are set in your environment (e.g. Vercel Project Settings) or configured via Settings.'
        )
      );
      return;
    }

    const isVideo =
      file.type.startsWith('video') ||
      (options.filename && /\.(mp4|mov|webm|avi|mkv)$/i.test(options.filename));

    const resourceType = isVideo ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file, options.filename || (file as File).name || 'upload');
    formData.append('upload_preset', uploadPreset);
    // Note: tags are NOT appended to FormData because Cloudinary unsigned upload presets by default
    // reject client-side tags with 'Tagging is not allowed for unsigned upload'.
    // LUMORA maintains rich semantic tags locally and in Firestore via Gemini AI insights.

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(Math.min(percent, 99)); // Keep at 99 until response parsed
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (onProgress) onProgress(100);

          const rawUrl = res.secure_url || res.url || '';
          // Ensure https protocol to prevent mixed-content blocking on Vercel HTTPS
          const secure_url = rawUrl.startsWith('http://')
            ? rawUrl.replace('http://', 'https://')
            : rawUrl;

          const asset: CloudinaryAsset = {
            asset_id: res.asset_id || `as_${Date.now()}`,
            public_id: res.public_id,
            resource_type: res.resource_type || (isVideo ? 'video' : 'image'),
            format: res.format || (isVideo ? 'mp4' : 'jpg'),
            width: res.width || (isVideo ? 1920 : 1200),
            height: res.height || (isVideo ? 1080 : 800),
            duration: res.duration,
            bytes: res.bytes || file.size,
            secure_url,
            created_at: res.created_at || new Date().toISOString(),
          };
          resolve(asset);
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response.'));
        }
      } else {
        try {
          const errorRes = JSON.parse(xhr.responseText);
          const errorMsg =
            errorRes?.error?.message ||
            `Cloudinary upload failed with status ${xhr.status}`;
          reject(new Error(errorMsg));
        } catch (_) {
          reject(new Error(`Cloudinary upload failed (HTTP ${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred while connecting to Cloudinary. Check your network or Vercel CORS policy.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Cloudinary upload timed out. Please verify your connection.'));
    };

    xhr.send(formData);
  });
}

/**
 * Cloudinary Transformation Utilities:
 * Injects automatic format selection (f_auto) and quality optimization (q_auto),
 * plus responsive sizing.
 */
export function getOptimizedImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'limit' | 'thumb' | 'fit';
    aspectRatio?: string;
  }
): string {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('cloudinary.com')) return url;

  let targetUrl = url;

  // Upgrade http to https to prevent Mixed Content blocking on HTTPS production (Vercel)
  if (targetUrl.startsWith('http://res.cloudinary.com/')) {
    targetUrl = targetUrl.replace('http://', 'https://');
  }

  // If a video asset is being rendered as an image thumbnail, Cloudinary requires
  // the file extension to be changed to .jpg to extract a video poster frame.
  if (targetUrl.includes('/video/upload/') || /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(targetUrl)) {
    targetUrl = targetUrl.replace(/\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i, '.jpg$2');
  }

  const parts: string[] = ['f_auto', 'q_auto'];

  if (options?.width) {
    parts.push(`w_${options.width}`);
  }
  if (options?.height) {
    parts.push(`h_${options.height}`);
  }
  if (options?.crop) {
    // Cloudinary 'c_fill' strictly requires both width and height, or aspectRatio!
    // If height is missing and no aspectRatio is provided, fallback to 'c_limit' to avoid HTTP 400 Bad Request error.
    if (options.crop === 'fill' && !options.height && !options.aspectRatio) {
      if (options.width) {
        parts.push('c_limit');
      }
    } else {
      parts.push(`c_${options.crop}`);
    }
  }
  if (options?.aspectRatio) {
    parts.push(`ar_${options.aspectRatio}`);
  }

  const transformString = parts.join(',');

  // Insert transformations right after /upload/
  if (targetUrl.includes('/upload/')) {
    // Avoid double transformation injection
    if (targetUrl.includes('/upload/f_auto') || targetUrl.includes('/upload/q_auto')) {
      return targetUrl;
    }
    return targetUrl.replace('/upload/', `/upload/${transformString}/`);
  }

  return targetUrl;
}

/**
 * Cloudinary Video Transformation Utility:
 * Automatic video codec, quality, and streaming optimizations.
 */
export function getOptimizedVideoUrl(
  url: string,
  options?: {
    width?: number;
    quality?: 'auto' | 'good' | 'eco';
  }
): string {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('cloudinary.com')) return url;

  let targetUrl = url;
  if (targetUrl.startsWith('http://res.cloudinary.com/')) {
    targetUrl = targetUrl.replace('http://', 'https://');
  }

  const parts: string[] = ['f_auto', `q_${options?.quality || 'auto'}`, 'vc_auto'];

  if (options?.width) {
    parts.push(`w_${options.width}`);
  }

  const transformString = parts.join(',');

  if (targetUrl.includes('/upload/')) {
    if (targetUrl.includes('/upload/f_auto') || targetUrl.includes('/upload/vc_auto')) {
      return targetUrl;
    }
    return targetUrl.replace('/upload/', `/upload/${transformString}/`);
  }

  return targetUrl;
}

/**
 * Helper to format byte sizes into readable strings (e.g. 4.8 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
