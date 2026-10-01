import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const TimelineOrbCanvas: React.FC = () => {
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
      const width = container.clientWidth || 240;
      const height = container.clientHeight || 240;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      // Studio lighting
      const ambientLight = new THREE.AmbientLight(0xf5efff, 1.8);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xfff8fa, 2.8);
      keyLight.position.set(4, 5, 5);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(0x69e1d4, 3.2, 10);
      rimLight.position.set(-4, -2, 3);
      scene.add(rimLight);

      // Translucent Memory Orb
      const orbMat = new THREE.MeshPhysicalMaterial({
        color: 0xf5efff,
        transmission: 0.92,
        roughness: 0.12,
        ior: 1.48,
        thickness: 1.8,
        clearcoat: 1.0,
        attenuationColor: new THREE.Color(0xd1c4ff),
        attenuationDistance: 1.6,
        transparent: true,
        opacity: 0.92,
      });
      const orbGeo = new THREE.SphereGeometry(1.25, 48, 48);
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      group.add(orbMesh);

      // Inner Luminous Core
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x6d5dfb,
        emissive: 0x7666fc,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), coreMat);
      group.add(coreMesh);

      // Thin Orbital Ring (Memory Pathway)
      const ringMat = new THREE.MeshPhysicalMaterial({
        color: 0xb8a7ff,
        transmission: 0.85,
        roughness: 0.2,
        thickness: 0.4,
        transparent: true,
        opacity: 0.7,
      });
      const ringGeo = new THREE.TorusGeometry(1.85, 0.026, 20, 80);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.set(Math.PI * 0.38, Math.PI * 0.15, 0);
      group.add(ringMesh);

      // Subtle Floating Mini Card 1 (Left)
      const cardMat1 = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.15,
        clearcoat: 0.9,
      });
      const card1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.6, 0.02), cardMat1);
      card1.position.set(-1.45, 0.4, 0.6);
      card1.rotation.set(-0.15, 0.35, 0.08);
      group.add(card1);

      // Subtle Floating Mini Card 2 (Right)
      const cardMat2 = new THREE.MeshPhysicalMaterial({
        color: 0xfefefe,
        roughness: 0.15,
        clearcoat: 0.9,
      });
      const card2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.52, 0.02), cardMat2);
      card2.position.set(1.4, -0.45, 0.4);
      card2.rotation.set(0.18, -0.3, -0.1);
      group.add(card2);

      const clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        group.rotation.y = t * 0.12;
        group.rotation.x = Math.sin(t * 0.14) * 0.06;

        coreMesh.scale.setScalar(0.96 + Math.sin(t * 1.4) * 0.05);
        ringMesh.rotation.z = t * 0.1;

        card1.position.y = 0.4 + Math.sin(t * 0.8) * 0.06;
        card2.position.y = -0.45 + Math.cos(t * 0.75 + 1) * 0.05;

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
  }, []);

  if (isWebGLAvailable === false) {
    return (
      <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6D5DFB]/40 via-[#B8A7FF]/30 to-[#69E1D4]/40 blur-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#6D5DFB]/15 via-[#F4A7D8]/10 to-[#69E1D4]/12 rounded-full blur-2xl pointer-events-none" />
      <div ref={containerRef} className="w-full h-full relative z-10" />
    </div>
  );
};
