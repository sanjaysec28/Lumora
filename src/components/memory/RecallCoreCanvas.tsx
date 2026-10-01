import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface RecallCoreCanvasProps {
  isAsking?: boolean;
}

export const RecallCoreCanvas: React.FC<RecallCoreCanvasProps> = ({ isAsking = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setIsWebGLAvailable(false);
      return;
    }

    let hasWebGL = false;
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      hasWebGL = !!(gl && gl instanceof WebGLRenderingContext);
    } catch {
      hasWebGL = false;
    }

    if (!hasWebGL) {
      setIsWebGLAvailable(false);
      return;
    }

    setIsWebGLAvailable(true);
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number = 0;

    try {
      const width = container.clientWidth || 200;
      const height = container.clientHeight || 200;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      // Light
      const ambientLight = new THREE.AmbientLight(0xf4eeff, 2.0);
      scene.add(ambientLight);

      const topLight = new THREE.PointLight(0xb8a7ff, 3.5, 12);
      topLight.position.set(0, 3, 3);
      scene.add(topLight);

      const rimLight = new THREE.PointLight(0x69e1d4, 3.0, 10);
      rimLight.position.set(-3, -2, 2);
      scene.add(rimLight);

      // Glowing Conversational Query Orb
      const orbMat = new THREE.MeshPhysicalMaterial({
        color: 0xf8f5ff,
        transmission: 0.94,
        roughness: 0.08,
        ior: 1.5,
        thickness: 1.6,
        clearcoat: 1.0,
        attenuationColor: new THREE.Color(0xb8a7ff),
        attenuationDistance: 1.5,
        transparent: true,
        opacity: 0.92,
      });
      const orbMesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 36, 36), orbMat);
      group.add(orbMesh);

      // Radiant Core
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x6d5dfb,
        emissive: 0x6d5dfb,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), coreMat);
      group.add(coreMesh);

      // Two subtle gyroscopic rings around core
      const ringMat1 = new THREE.MeshPhysicalMaterial({
        color: 0x69e1d4,
        roughness: 0.2,
        transmission: 0.8,
        transparent: true,
        opacity: 0.6,
      });
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.02, 16, 64), ringMat1);
      ring1.rotation.set(Math.PI * 0.35, Math.PI * 0.2, 0);
      group.add(ring1);

      const ringMat2 = new THREE.MeshPhysicalMaterial({
        color: 0xf4a7d8,
        roughness: 0.2,
        transmission: 0.8,
        transparent: true,
        opacity: 0.6,
      });
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.018, 16, 64), ringMat2);
      ring2.rotation.set(-Math.PI * 0.4, -Math.PI * 0.25, Math.PI * 0.1);
      group.add(ring2);

      // Tiny memory query particles
      const pCount = 20;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 3.8;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 3.8;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 3.8;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        size: 0.07,
        color: 0xb8a7ff,
        transparent: true,
        opacity: 0.75,
      });
      const particles = new THREE.Points(pGeo, pMat);
      group.add(particles);

      const clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        const speed = isAsking ? 2.4 : 1.0;
        group.rotation.y = t * 0.15 * speed;

        ring1.rotation.z = t * 0.2 * speed;
        ring2.rotation.z = -t * 0.25 * speed;

        coreMesh.scale.setScalar(0.95 + Math.sin(t * (isAsking ? 4 : 1.5)) * 0.08);
        particles.rotation.y = t * 0.04 * speed;

        renderer?.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        if (renderer) {
          if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
        }
      };
    } catch {
      setIsWebGLAvailable(false);
    }
  }, [isAsking]);

  if (isWebGLAvailable === false) {
    return (
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6D5DFB]/40 via-[#F4A7D8]/30 to-[#69E1D4]/40 blur-md animate-pulse" />
    );
  }

  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center pointer-events-none select-none">
      <div className="absolute inset-0 rounded-full bg-[#6D5DFB]/20 blur-xl pointer-events-none" />
      <div ref={containerRef} className="w-full h-full relative z-10" />
    </div>
  );
};
