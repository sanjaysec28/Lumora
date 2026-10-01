import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean | null>(null);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    // 1. Guard against non-browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setIsWebGLAvailable(false);
      return;
    }

    // 2. Test WebGL context support safely
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
      const width = Math.max(container.clientWidth || 0, 480);
      const height = Math.max(container.clientHeight || 0, 440);

      // --- Scene with Subtle Atmospheric Fog ---
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0xfff9fc, 0.016);

      // --- Perspective Camera ---
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0, 10.8);

      // --- WebGL Renderer ---
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      container.appendChild(renderer.domElement);

      // --- Hierarchical Groups for Depth-Separated Parallax ---
      const mainGroup = new THREE.Group();
      scene.add(mainGroup);

      // --- Curated Studio Lighting (Editorial & Diffused) ---
      const ambientLight = new THREE.AmbientLight(0xf4eeff, 1.8);
      scene.add(ambientLight);

      // Warm Key Light from Top-Right
      const keyLight = new THREE.DirectionalLight(0xfff8fa, 3.4);
      keyLight.position.set(6, 7, 7);
      scene.add(keyLight);

      // Soft Back-Glow Point Light behind the memory core
      const coreBackLight = new THREE.PointLight(0xb8a7ff, 3.2, 14);
      coreBackLight.position.set(0, 0, -2.5);
      scene.add(coreBackLight);

      // Soft Cyan Rim Light (crisp glassy highlights on left curves)
      const cyanRimLight = new THREE.PointLight(0x69e1d4, 4.2, 16);
      cyanRimLight.position.set(-6, -2.5, 3.5);
      scene.add(cyanRimLight);

      // Rose Accent Light (warm glow from right)
      const roseAccentLight = new THREE.PointLight(0xf4a7d8, 3.4, 15);
      roseAccentLight.position.set(5.5, -3.2, 3);
      scene.add(roseAccentLight);

      // Lumora Violet Top Spotlight
      const violetTopLight = new THREE.PointLight(0x6d5dfb, 3.5, 14);
      violetTopLight.position.set(0, 5.5, 2.5);
      scene.add(violetTopLight);

      // --- Materials ---
      // Translucent glossy glass for central memory orb
      const glassOrbMat = new THREE.MeshPhysicalMaterial({
        color: 0xf6f2ff,
        transmission: 0.92,
        roughness: 0.1,
        ior: 1.48,
        thickness: 2.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        attenuationColor: new THREE.Color(0xcac0ff),
        attenuationDistance: 2.0,
        transparent: true,
        opacity: 0.95,
      });

      // Internal luminous memory core
      const glowingCoreMat = new THREE.MeshStandardMaterial({
        color: 0x6d5dfb,
        emissive: 0x7666fc,
        emissiveIntensity: 0.75,
        roughness: 0.18,
        transparent: true,
        opacity: 0.92,
      });

      // Orbital Ring Materials (thin, memory pathways)
      const ringLavenderMat = new THREE.MeshPhysicalMaterial({
        color: 0xb8a7ff,
        transmission: 0.85,
        roughness: 0.2,
        ior: 1.4,
        thickness: 0.5,
        clearcoat: 0.9,
        transparent: true,
        opacity: 0.7,
      });

      const ringCyanMat = new THREE.MeshPhysicalMaterial({
        color: 0x69e1d4,
        transmission: 0.88,
        roughness: 0.18,
        ior: 1.42,
        thickness: 0.4,
        clearcoat: 0.9,
        transparent: true,
        opacity: 0.65,
      });

      const ringPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf4a7d8,
        transmission: 0.86,
        roughness: 0.22,
        ior: 1.4,
        thickness: 0.4,
        clearcoat: 0.9,
        transparent: true,
        opacity: 0.65,
      });

      // Ambient Secondary Object Materials
      const frostedCubeMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.93,
        roughness: 0.12,
        ior: 1.5,
        thickness: 1.2,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.85,
      });

      const pearlMat = new THREE.MeshStandardMaterial({
        color: 0xfbf8ff,
        roughness: 0.16,
        metalness: 0.15,
      });

      const smallCyanSphereMat = new THREE.MeshPhysicalMaterial({
        color: 0x69e1d4,
        transmission: 0.9,
        roughness: 0.15,
        ior: 1.46,
        thickness: 0.8,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.88,
      });

      // --- 1. Central Memory Orb & Luminous Core ---
      // Large semi-transparent glossy 3D orb (The Memory Core)
      const orbGeo = new THREE.SphereGeometry(1.78, 64, 64);
      const orbMesh = new THREE.Mesh(orbGeo, glassOrbMat);
      orbMesh.position.set(0, 0, 0);
      mainGroup.add(orbMesh);

      // Inner pulsating nucleus
      const coreGeo = new THREE.SphereGeometry(0.72, 32, 32);
      const coreMesh = new THREE.Mesh(coreGeo, glowingCoreMat);
      coreMesh.position.set(0, 0, 0);
      mainGroup.add(coreMesh);

      // Subtle inner crystalline refraction facet (accentuates depth)
      const facetGeo = new THREE.IcosahedronGeometry(1.15, 0);
      const facetMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.96,
        roughness: 0.06,
        ior: 1.52,
        thickness: 1.0,
        transparent: true,
        opacity: 0.45,
      });
      const facetMesh = new THREE.Mesh(facetGeo, facetMat);
      facetMesh.position.set(0, 0, 0);
      mainGroup.add(facetMesh);

      // --- 2. Multiple Orbital Rings (Memory Pathways) ---
      // Ring 1: Outer Lavender pathway
      const ring1Geo = new THREE.TorusGeometry(3.15, 0.038, 24, 120);
      const ring1Mesh = new THREE.Mesh(ring1Geo, ringLavenderMat);
      ring1Mesh.rotation.set(Math.PI * 0.38, Math.PI * 0.14, 0);
      ring1Mesh.position.set(0.08, 0.04, 0.1);
      mainGroup.add(ring1Mesh);

      // Ring 2: Mid Cyan pathway (slanted opposite)
      const ring2Geo = new THREE.TorusGeometry(2.55, 0.032, 24, 100);
      const ring2Mesh = new THREE.Mesh(ring2Geo, ringCyanMat);
      ring2Mesh.rotation.set(Math.PI * 0.64, -Math.PI * 0.28, Math.PI * 0.1);
      ring2Mesh.position.set(-0.1, -0.08, -0.15);
      mainGroup.add(ring2Mesh);

      // Ring 3: Inner Rose pathway (transversal)
      const ring3Geo = new THREE.TorusGeometry(2.08, 0.026, 24, 90);
      const ring3Mesh = new THREE.Mesh(ring3Geo, ringPinkMat);
      ring3Mesh.rotation.set(-Math.PI * 0.32, Math.PI * 0.48, -Math.PI * 0.15);
      ring3Mesh.position.set(0.05, -0.12, 0.18);
      mainGroup.add(ring3Mesh);

      // --- 3. Living Memory Photo Slides (High-Aesthetic Canvas Textures) ---
      const createPhotoTexture = (
        type: 'dolomites' | 'florence' | 'coastal' | 'cafe' | 'kyoto'
      ): THREE.CanvasTexture => {
        const cv = document.createElement('canvas');
        cv.width = 600;
        cv.height = 420;
        const ctx = cv.getContext('2d');
        if (!ctx) return new THREE.CanvasTexture(cv);

        // Clip rounded rectangle for physical photo card appearance
        const radius = 22;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(600 - radius, 0);
        ctx.quadraticCurveTo(600, 0, 600, radius);
        ctx.lineTo(600, 420 - radius);
        ctx.quadraticCurveTo(600, 420, 600 - radius, 420);
        ctx.lineTo(radius, 420);
        ctx.quadraticCurveTo(0, 420, 0, 420 - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();

        if (type === 'dolomites') {
          // Alpine dawn gradient
          const skyGrad = ctx.createLinearGradient(0, 0, 0, 420);
          skyGrad.addColorStop(0, '#1E103E');
          skyGrad.addColorStop(0.42, '#6D5DFB');
          skyGrad.addColorStop(0.72, '#F4A7D8');
          skyGrad.addColorStop(1, '#FFECC9');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, 600, 420);

          // Golden Dawn Sun Glow
          const sun = ctx.createRadialGradient(440, 230, 10, 440, 230, 130);
          sun.addColorStop(0, '#FFFFFF');
          sun.addColorStop(0.35, 'rgba(255, 238, 180, 0.85)');
          sun.addColorStop(1, 'rgba(244, 167, 216, 0)');
          ctx.fillStyle = sun;
          ctx.beginPath();
          ctx.arc(440, 230, 130, 0, Math.PI * 2);
          ctx.fill();

          // Mountain Silhouettes
          ctx.fillStyle = '#2A1A4E';
          ctx.beginPath();
          ctx.moveTo(0, 420);
          ctx.lineTo(95, 240);
          ctx.lineTo(200, 300);
          ctx.lineTo(340, 180);
          ctx.lineTo(460, 270);
          ctx.lineTo(600, 195);
          ctx.lineTo(600, 420);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#170E30';
          ctx.beginPath();
          ctx.moveTo(0, 420);
          ctx.lineTo(150, 290);
          ctx.lineTo(280, 335);
          ctx.lineTo(420, 255);
          ctx.lineTo(550, 310);
          ctx.lineTo(600, 265);
          ctx.lineTo(600, 420);
          ctx.closePath();
          ctx.fill();

          // Editorial Tag Overlay
          ctx.fillStyle = 'rgba(255,255,255,0.96)';
          ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('Dolomites · Alpine Ridge', 32, 375);
        } else if (type === 'florence') {
          // Warm Florence dusk along Arno river
          const duskGrad = ctx.createLinearGradient(0, 0, 0, 420);
          duskGrad.addColorStop(0, '#2F175C');
          duskGrad.addColorStop(0.48, '#764C93');
          duskGrad.addColorStop(0.82, '#DD7D78');
          duskGrad.addColorStop(1, '#F8B568');
          ctx.fillStyle = duskGrad;
          ctx.fillRect(0, 0, 600, 420);

          // River Water reflection
          const waterGrad = ctx.createLinearGradient(0, 280, 0, 420);
          waterGrad.addColorStop(0, '#532D5F');
          waterGrad.addColorStop(1, '#F8B568');
          ctx.fillStyle = waterGrad;
          ctx.fillRect(0, 280, 600, 140);

          // Bridge Arches Silhouette (Ponte Vecchio style)
          ctx.fillStyle = '#1D0E38';
          ctx.fillRect(70, 250, 460, 32);
          ctx.fillStyle = '#764C93';
          ctx.beginPath();
          ctx.arc(160, 282, 35, Math.PI, 0, false);
          ctx.arc(300, 282, 44, Math.PI, 0, false);
          ctx.arc(440, 282, 35, Math.PI, 0, false);
          ctx.fill();

          ctx.fillStyle = 'rgba(255,255,255,0.96)';
          ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('Florence · Golden Hour', 32, 375);
        } else if (type === 'coastal') {
          // Azure Pacific coastline
          const oceanGrad = ctx.createLinearGradient(0, 0, 600, 420);
          oceanGrad.addColorStop(0, '#8DDCFF');
          oceanGrad.addColorStop(0.42, '#489AF5');
          oceanGrad.addColorStop(0.8, '#1A5399');
          oceanGrad.addColorStop(1, '#0C2652');
          ctx.fillStyle = oceanGrad;
          ctx.fillRect(0, 0, 600, 420);

          // Sea foam wave curves
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 16;
          ctx.beginPath();
          ctx.moveTo(-20, 210);
          ctx.bezierCurveTo(190, 280, 330, 140, 620, 245);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(105, 225, 212, 0.75)';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(-20, 224);
          ctx.bezierCurveTo(190, 294, 330, 154, 620, 259);
          ctx.stroke();

          ctx.fillStyle = 'rgba(255,255,255,0.96)';
          ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('Pacific Highway · Coast', 32, 375);
        } else if (type === 'cafe') {
          // Warm cafe candlelight bokeh
          const cafeGrad = ctx.createLinearGradient(0, 0, 600, 420);
          cafeGrad.addColorStop(0, '#2A132C');
          cafeGrad.addColorStop(0.58, '#52223B');
          cafeGrad.addColorStop(1, '#903F46');
          ctx.fillStyle = cafeGrad;
          ctx.fillRect(0, 0, 600, 420);

          // Bokeh circles
          const bColors = ['#FFE8B8', '#F4A7D8', '#FFB870', '#E5A4FF'];
          for (let i = 0; i < 11; i++) {
            ctx.fillStyle = bColors[i % bColors.length] + '44';
            ctx.beginPath();
            ctx.arc(70 + (i * 58) % 470, 80 + (i * 38) % 230, 28 + (i * 6), 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = 'rgba(255,255,255,0.96)';
          ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('Trastevere Cafe · Autumn', 32, 375);
        } else {
          // Kyoto Bamboo Path / Morning mist
          const kyotoGrad = ctx.createLinearGradient(0, 0, 0, 420);
          kyotoGrad.addColorStop(0, '#102A24');
          kyotoGrad.addColorStop(0.5, '#22584A');
          kyotoGrad.addColorStop(0.85, '#68B69A');
          kyotoGrad.addColorStop(1, '#E6F8EE');
          ctx.fillStyle = kyotoGrad;
          ctx.fillRect(0, 0, 600, 420);

          // Vertical Bamboo Stalks
          const stalks = [60, 130, 190, 270, 360, 430, 500, 560];
          stalks.forEach((x, idx) => {
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(12, 40, 32, 0.85)' : 'rgba(26, 70, 58, 0.7)';
            ctx.fillRect(x, 0, 16 + (idx % 3) * 6, 420);
            // Bamboo rings
            ctx.fillStyle = 'rgba(160, 220, 195, 0.5)';
            for (let y = 60; y < 420; y += 75) {
              ctx.fillRect(x - 2, y, 20 + (idx % 3) * 6, 4);
            }
          });

          // Soft Morning Light Sunbeam
          const beam = ctx.createLinearGradient(200, 0, 450, 420);
          beam.addColorStop(0, 'rgba(255, 255, 230, 0.45)');
          beam.addColorStop(1, 'rgba(255, 255, 230, 0)');
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(180, 0);
          ctx.lineTo(320, 0);
          ctx.lineTo(480, 420);
          ctx.lineTo(340, 420);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = 'rgba(255,255,255,0.96)';
          ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('Arashiyama · Bamboo Mist', 32, 375);
        }

        // Glossy Diagonal Light Sheen (Top-Left to Center)
        const glossGrad = ctx.createLinearGradient(0, 0, 320, 280);
        glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
        glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glossGrad;
        ctx.fillRect(0, 0, 600, 420);

        // Thin Crisp White Border (Physical glossy photo edge)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.lineWidth = 5;
        ctx.stroke();

        return new THREE.CanvasTexture(cv);
      };

      // --- 4. Organic Editorial Constellation: 5 Floating Photo Cards ---
      // Slide 1: Primary Feature (Left Foreground - Sharpest, in front of orb)
      const slideGeo1 = new THREE.BoxGeometry(1.95, 1.36, 0.04);
      const slideMat1 = new THREE.MeshPhysicalMaterial({
        map: createPhotoTexture('dolomites'),
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 0.75,
      });
      const slide1 = new THREE.Mesh(slideGeo1, slideMat1);
      slide1.position.set(-2.15, 0.28, 1.55);
      slide1.rotation.set(-0.14, 0.32, 0.06);
      mainGroup.add(slide1);

      // Slide 2: Golden Sunset (Right Upper Background - Partially behind orb upper right)
      const slideGeo2 = new THREE.BoxGeometry(1.72, 1.2, 0.04);
      const slideMat2 = new THREE.MeshPhysicalMaterial({
        map: createPhotoTexture('florence'),
        roughness: 0.16,
        clearcoat: 0.85,
        transparent: true,
        opacity: 0.88,
      });
      const slide2 = new THREE.Mesh(slideGeo2, slideMat2);
      slide2.position.set(2.15, 1.38, -0.65);
      slide2.rotation.set(0.15, -0.34, -0.07);
      mainGroup.add(slide2);

      // Slide 3: Azure Coast (Right Lower Midground - In front lower right)
      const slideGeo3 = new THREE.BoxGeometry(1.68, 1.18, 0.04);
      const slideMat3 = new THREE.MeshPhysicalMaterial({
        map: createPhotoTexture('coastal'),
        roughness: 0.12,
        clearcoat: 0.95,
        clearcoatRoughness: 0.06,
        transparent: true,
        opacity: 0.96,
      });
      const slide3 = new THREE.Mesh(slideGeo3, slideMat3);
      slide3.position.set(1.9, -1.25, 0.95);
      slide3.rotation.set(-0.18, -0.26, 0.08);
      mainGroup.add(slide3);

      // Slide 4: Cafe Evening (Left Lower Background - Sits slightly behind lower left)
      const slideGeo4 = new THREE.BoxGeometry(1.52, 1.06, 0.04);
      const slideMat4 = new THREE.MeshPhysicalMaterial({
        map: createPhotoTexture('cafe'),
        roughness: 0.18,
        clearcoat: 0.8,
        transparent: true,
        opacity: 0.86,
      });
      const slide4 = new THREE.Mesh(slideGeo4, slideMat4);
      slide4.position.set(-1.85, -1.52, -0.45);
      slide4.rotation.set(0.19, 0.28, -0.1);
      mainGroup.add(slide4);

      // Slide 5: Kyoto Mist (Small Accent Card - Top Constellation Peak)
      const slideGeo5 = new THREE.BoxGeometry(1.26, 0.88, 0.04);
      const slideMat5 = new THREE.MeshPhysicalMaterial({
        map: createPhotoTexture('kyoto'),
        roughness: 0.14,
        clearcoat: 0.9,
        transparent: true,
        opacity: 0.94,
      });
      const slide5 = new THREE.Mesh(slideGeo5, slideMat5);
      slide5.position.set(0.18, 2.32, 0.38);
      slide5.rotation.set(-0.08, 0.12, -0.04);
      mainGroup.add(slide5);

      // --- 5. Small Ambient 3D Objects (Depth Balance) ---
      // Frosted Translucent Cube 1 (Upper Left Depth)
      const cube1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), frostedCubeMat);
      cube1.position.set(-2.65, 1.8, -0.75);
      mainGroup.add(cube1);

      // Frosted Translucent Cube 2 (Right Midground Depth)
      const cube2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), frostedCubeMat);
      cube2.position.set(2.6, -0.55, 0.35);
      mainGroup.add(cube2);

      // Small Glass Sphere (Far Left Midground)
      const smallGlassSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), smallCyanSphereMat);
      smallGlassSphere.position.set(-2.85, -0.38, 0.72);
      mainGroup.add(smallGlassSphere);

      // Small Pearl-like Sphere (Lower Right Depth)
      const pearlSphere = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), pearlMat);
      pearlSphere.position.set(0.75, -2.35, -0.45);
      mainGroup.add(pearlSphere);

      // Tiny Rounded Prism / Octahedron (Upper Right Accent)
      const tinyPrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), frostedCubeMat);
      tinyPrism.position.set(2.7, 2.1, 0.15);
      mainGroup.add(tinyPrism);

      // --- 6. Memory Connections (3-5 Extremely Thin Glowing Lines) ---
      // Connecting selected photo cards to the central memory core
      const connectionLines: { line: THREE.Line; start: THREE.Vector3; endTarget: THREE.Mesh; ctrlOffset: THREE.Vector3 }[] = [];
      const targets = [
        { mesh: slide1, ctrl: new THREE.Vector3(-1.0, 0.4, 0.7) },
        { mesh: slide2, ctrl: new THREE.Vector3(1.1, 0.7, -0.2) },
        { mesh: slide3, ctrl: new THREE.Vector3(0.9, -0.7, 0.4) },
        { mesh: slide5, ctrl: new THREE.Vector3(0.1, 1.2, 0.2) },
      ];

      targets.forEach((item, idx) => {
        const lineGeo = new THREE.BufferGeometry();
        // Allocate 28 points
        const points = new Float32Array(28 * 3);
        lineGeo.setAttribute('position', new THREE.BufferAttribute(points, 3));
        const lineMat = new THREE.LineBasicMaterial({
          color: idx % 2 === 0 ? 0xb8a7ff : 0x69e1d4,
          transparent: true,
          opacity: 0.35,
          linewidth: 1,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        mainGroup.add(line);
        connectionLines.push({
          line,
          start: new THREE.Vector3(0, 0, 0),
          endTarget: item.mesh,
          ctrlOffset: item.ctrl,
        });
      });

      // --- 7. Memory Particles (Subtle Minimal Points) ---
      const particleCount = 32;
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);

      const colorPalette = [
        new THREE.Color(0xb8a7ff), // Lavender
        new THREE.Color(0x69e1d4), // Cyan
        new THREE.Color(0xf4a7d8), // Soft pink
        new THREE.Color(0xffffff), // Soft white
      ];

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 8.5;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5.5;

        const col = colorPalette[i % colorPalette.length];
        particleColors[i * 3] = col.r;
        particleColors[i * 3 + 1] = col.g;
        particleColors[i * 3 + 2] = col.b;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.075,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
      });

      const particles = new THREE.Points(particleGeo, particleMat);
      mainGroup.add(particles);

      setIsSceneReady(true);

      // --- Mouse Move Parallax ---
      const handleMouseMove = (e: MouseEvent) => {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const clientX = e.clientX - rect.left;
          const clientY = e.clientY - rect.top;
          mouseRef.current.targetX = (clientX / rect.width - 0.5) * 2;
          mouseRef.current.targetY = -(clientY / rect.height - 0.5) * 2;
        }
      };

      window.addEventListener('mousemove', handleMouseMove);

      // --- Resize Listener ---
      const handleResize = () => {
        if (!container || !renderer) return;
        const w = Math.max(container.clientWidth || 0, 360);
        const h = Math.max(container.clientHeight || 0, 360);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      // --- Cinematic Animation Loop ---
      const clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Parallax lerp
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.045;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.045;

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;

        // Main group subtle tilt
        mainGroup.rotation.y = mx * 0.22 + Math.sin(t * 0.18) * 0.04;
        mainGroup.rotation.x = -my * 0.14 + Math.cos(t * 0.15) * 0.03;

        // 1. Central Orb & Luminous Core Slow Rotation & Gentle Breathing
        orbMesh.rotation.y = t * 0.08;
        facetMesh.rotation.y = -t * 0.12;
        facetMesh.rotation.x = Math.sin(t * 0.1) * 0.15;
        coreMesh.scale.setScalar(0.96 + Math.sin(t * 1.3) * 0.05);

        // 2. Orbital Rings: Distinct Slow Speeds & Subtle Undulation
        ring1Mesh.rotation.z = t * 0.09;
        ring1Mesh.position.y = 0.04 + Math.sin(t * 0.65) * 0.05;

        ring2Mesh.rotation.z = -t * 0.11;
        ring2Mesh.position.y = -0.08 + Math.cos(t * 0.72) * 0.05;

        ring3Mesh.rotation.z = t * 0.13;
        ring3Mesh.position.y = -0.12 + Math.sin(t * 0.8) * 0.04;

        // 3. Floating Photo Cards: Organic Editorial Weightlessness & Depth Parallax
        // Slide 1 (Foreground, larger parallax factor)
        slide1.position.y = 0.28 + Math.sin(t * 0.75) * 0.07;
        slide1.position.x = -2.15 + mx * 0.16;
        slide1.rotation.z = 0.06 + Math.cos(t * 0.55) * 0.025;

        // Slide 2 (Background, gentle undulation)
        slide2.position.y = 1.38 + Math.cos(t * 0.68 + 1) * 0.065;
        slide2.position.x = 2.15 + mx * 0.06;
        slide2.rotation.z = -0.07 + Math.sin(t * 0.5) * 0.02;

        // Slide 3 (Midground)
        slide3.position.y = -1.25 + Math.sin(t * 0.85 + 2) * 0.065;
        slide3.position.x = 1.9 + mx * 0.12;
        slide3.rotation.z = 0.08 + Math.cos(t * 0.65) * 0.02;

        // Slide 4 (Lower background)
        slide4.position.y = -1.52 + Math.cos(t * 0.78 + 3) * 0.055;
        slide4.position.x = -1.85 + mx * 0.07;

        // Slide 5 (Top constellation peak)
        slide5.position.y = 2.32 + Math.sin(t * 0.7 + 1.5) * 0.055;
        slide5.position.x = 0.18 + mx * 0.1;

        // 4. Secondary 3D Ambient Objects
        cube1.rotation.x = t * 0.15;
        cube1.rotation.y = t * 0.12;
        cube1.position.y = 1.8 + Math.sin(t * 0.8) * 0.05;

        cube2.rotation.x = -t * 0.18;
        cube2.rotation.z = t * 0.14;
        cube2.position.y = -0.55 + Math.cos(t * 0.9) * 0.04;

        smallGlassSphere.position.y = -0.38 + Math.sin(t * 1.05) * 0.06;
        pearlSphere.position.y = -2.35 + Math.cos(t * 0.95) * 0.05;

        tinyPrism.rotation.x = t * 0.22;
        tinyPrism.rotation.y = t * 0.18;
        tinyPrism.position.y = 2.1 + Math.sin(t * 0.75 + 2) * 0.05;

        // 5. Memory Connection Lines dynamic update
        connectionLines.forEach((item, idx) => {
          const endPos = item.endTarget.position;
          const curve = new THREE.QuadraticBezierCurve3(
            item.start,
            item.ctrlOffset,
            endPos
          );
          const pts = curve.getPoints(27);
          const posAttr = item.line.geometry.getAttribute('position') as THREE.BufferAttribute;
          for (let p = 0; p < pts.length; p++) {
            posAttr.setXYZ(p, pts[p].x, pts[p].y, pts[p].z);
          }
          posAttr.needsUpdate = true;

          // Subtle pulsing opacity
          const mat = item.line.material as THREE.LineBasicMaterial;
          mat.opacity = 0.22 + 0.14 * Math.sin(t * 1.2 + idx * 0.8);
        });

        // 6. Memory particles slow drift
        particles.rotation.y = t * 0.018;
        particles.rotation.x = Math.sin(t * 0.012) * 0.05;

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (renderer) {
          if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
        }
      };
    } catch (error) {
      console.warn('Three.js initialization fallback activated:', error);
      setIsWebGLAvailable(false);
      if (renderer) {
        try {
          renderer.dispose();
        } catch (_) {}
      }
    }
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] md:h-[550px] lg:h-[620px] flex items-center justify-center select-none">
      {/* 
        High-End Diffused Lighting & Bloom System (Section 9 Requirement)
        Lavender bloom + soft pink bloom + subtle cyan highlight + warm core light
      */}
      <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-[#6D5DFB]/25 via-[#F4A7D8]/20 to-[#69E1D4]/22 blur-3xl pointer-events-none" />
      <div className="absolute w-[50%] h-[50%] rounded-full bg-[#B8A7FF]/25 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute w-[35%] h-[35%] rounded-full bg-[#69E1D4]/18 blur-2xl pointer-events-none -translate-x-12 translate-y-8" />
      <div className="absolute w-[35%] h-[35%] rounded-full bg-[#F4A7D8]/18 blur-2xl pointer-events-none translate-x-14 -translate-y-8" />

      {/* 3D WebGL Canvas Layer */}
      {isWebGLAvailable !== false && (
        <div
          ref={containerRef}
          className={`w-full h-full relative z-10 transition-opacity duration-700 cursor-grab active:cursor-grabbing ${
            isSceneReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* 
        High-Fidelity Architectural SVG / 3D Fallback & Loading Visual
        Matches the exact luxury 5-card + central orb + 3-ring constellation
      */}
      {(!isSceneReady || isWebGLAvailable === false) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full drop-shadow-[0_24px_60px_rgba(59,38,126,0.18)] animate-pulse"
              style={{ animationDuration: '4.5s' }}
            >
              <defs>
                <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9FC" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#D9CEFF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6D5DFB" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9FC" />
                  <stop offset="60%" stopColor="#F4A7D8" />
                  <stop offset="100%" stopColor="#6D5DFB" />
                </linearGradient>
                <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#69E1D4" />
                  <stop offset="100%" stopColor="#3B267E" />
                </linearGradient>
                <linearGradient id="kyotoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#68B69A" />
                  <stop offset="100%" stopColor="#102A24" />
                </linearGradient>
              </defs>

              {/* Orbital Ring 1 (Outer Lavender) */}
              <ellipse
                cx="250"
                cy="250"
                rx="195"
                ry="85"
                transform="rotate(-24 250 250)"
                fill="none"
                stroke="#B8A7FF"
                strokeWidth="7"
                strokeOpacity="0.65"
              />

              {/* Orbital Ring 2 (Mid Cyan) */}
              <ellipse
                cx="248"
                cy="248"
                rx="155"
                ry="65"
                transform="rotate(38 248 248)"
                fill="none"
                stroke="#69E1D4"
                strokeWidth="5"
                strokeOpacity="0.55"
              />

              {/* Orbital Ring 3 (Inner Pink) */}
              <ellipse
                cx="252"
                cy="252"
                rx="120"
                ry="50"
                transform="rotate(-55 252 252)"
                fill="none"
                stroke="#F4A7D8"
                strokeWidth="4"
                strokeOpacity="0.5"
              />

              {/* Connection Lines */}
              <path
                d="M 250,250 Q 180,240 120,260"
                fill="none"
                stroke="#B8A7FF"
                strokeWidth="1.5"
                strokeOpacity="0.4"
                strokeDasharray="4 3"
              />
              <path
                d="M 250,250 Q 320,200 370,160"
                fill="none"
                stroke="#69E1D4"
                strokeWidth="1.5"
                strokeOpacity="0.4"
                strokeDasharray="4 3"
              />
              <path
                d="M 250,250 Q 250,180 255,105"
                fill="none"
                stroke="#B8A7FF"
                strokeWidth="1.5"
                strokeOpacity="0.4"
                strokeDasharray="4 3"
              />

              {/* Central Glossy Memory Orb */}
              <circle
                cx="250"
                cy="250"
                r="72"
                fill="url(#orbGrad)"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2.5"
              />
              {/* Inner Pulsing Core */}
              <circle cx="250" cy="250" r="30" fill="#6D5DFB" fillOpacity="0.75" />
              <circle cx="240" cy="238" r="16" fill="#FFFFFF" fillOpacity="0.55" />

              {/* Card 1: Left Foreground (Dolomites) */}
              <g transform="translate(60, 215) rotate(-8)">
                <rect
                  x="0"
                  y="0"
                  width="130"
                  height="90"
                  rx="12"
                  fill="url(#orbGrad)"
                  stroke="rgba(255,255,255,0.95)"
                  strokeWidth="2.5"
                />
                <rect x="8" y="8" width="114" height="52" rx="7" fill="rgba(255,255,255,0.22)" />
                <circle cx="75" cy="32" r="16" fill="#FFE8B8" fillOpacity="0.85" />
              </g>

              {/* Card 2: Right Upper (Florence) */}
              <g transform="translate(320, 115) rotate(10)">
                <rect
                  x="0"
                  y="0"
                  width="118"
                  height="82"
                  rx="10"
                  fill="url(#roseGrad)"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="2"
                />
                <rect x="8" y="8" width="102" height="46" rx="6" fill="rgba(255,255,255,0.2)" />
              </g>

              {/* Card 3: Lower Right (Coastal) */}
              <g transform="translate(305, 305) rotate(-10)">
                <rect
                  x="0"
                  y="0"
                  width="115"
                  height="80"
                  rx="10"
                  fill="url(#cyanGrad)"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="2"
                />
                <rect x="8" y="8" width="99" height="45" rx="6" fill="rgba(255,255,255,0.2)" />
              </g>

              {/* Card 4: Lower Left (Cafe) */}
              <g transform="translate(85, 320) rotate(12)">
                <rect
                  x="0"
                  y="0"
                  width="105"
                  height="72"
                  rx="9"
                  fill="url(#roseGrad)"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="2"
                />
              </g>

              {/* Card 5: Top Constellation Peak (Kyoto) */}
              <g transform="translate(205, 60) rotate(-4)">
                <rect
                  x="0"
                  y="0"
                  width="92"
                  height="64"
                  rx="8"
                  fill="url(#kyotoGrad)"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="2"
                />
              </g>

              {/* Secondary Ambient 3D Jewels */}
              <rect x="75" y="145" width="22" height="22" rx="4" fill="rgba(255,255,255,0.7)" transform="rotate(25 86 156)" />
              <rect x="390" y="245" width="18" height="18" rx="3" fill="rgba(255,255,255,0.7)" transform="rotate(-15 399 254)" />
              <circle cx="70" cy="275" r="14" fill="url(#cyanGrad)" />
              <circle cx="285" cy="385" r="15" fill="#FBF8FF" stroke="#B8A7FF" strokeWidth="2" />
            </svg>
          </div>
        </div>
      )}

      {/* Floating Story Arc Insight Callout (Editorial Anti-Slop Discipline) */}
      <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-4 z-20 glass-panel rounded-2xl px-4.5 py-3.5 shadow-[0_16px_40px_rgba(59,38,126,0.1)] border border-white/90 max-w-[250px] pointer-events-none">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6D5DFB] tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-[#69E1D4] shadow-[0_0_8px_#69E1D4]" />
          <span>Living Story Arc</span>
        </div>
        <p className="mt-1 text-xs text-[#171522] font-semibold leading-snug">
          Dolomites Alpine Traverse
        </p>
        <p className="mt-0.5 text-[11px] text-[#665F78]">
          14 moments · Dawn light, trail gear, summit
        </p>
      </div>

      {/* Floating Chapter Caption (Top Right) */}
      <div className="absolute top-4 right-2 sm:top-8 sm:right-6 z-20 glass-panel rounded-2xl px-4 py-2.5 shadow-[0_12px_32px_rgba(59,38,126,0.08)] border border-white/90 pointer-events-none">
        <div className="text-[11px] font-medium text-[#171522] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F4A7D8]" />
          <span className="font-semibold text-[#3B267E]">Florence Arno Dusk</span>
          <span className="text-[#665F78] text-[10px]">· Chapter 01</span>
        </div>
      </div>
    </div>
  );
};
