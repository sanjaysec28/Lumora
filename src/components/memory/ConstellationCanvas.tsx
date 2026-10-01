import React, { useEffect, useRef } from 'react';
import { GraphNodeItem } from '../../types';

interface ConstellationCanvasProps {
  nodes: GraphNodeItem[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  centerTitle: string;
  totalMoments: number;
}

export const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  centerTitle,
  totalMoments,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background celestial particles and dynamic connecting pulse lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number = 0;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 520);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Drifting celestial particles
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.5 + 0.2,
      color: ['#B8A7FF', '#69E1D4', '#F4A7D8', '#FFFFFF'][Math.floor(Math.random() * 4)],
    }));

    let t = 0;

    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric space gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        40,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.65
      );
      bgGrad.addColorStop(0, '#2C1B58');
      bgGrad.addColorStop(0.4, '#1C1238');
      bgGrad.addColorStop(1, '#110924');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial bloom behind center node
      const centerGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        10,
        width * 0.5,
        height * 0.5,
        160
      );
      centerGlow.addColorStop(0, 'rgba(109, 93, 251, 0.4)');
      centerGlow.addColorStop(0.5, 'rgba(184, 167, 255, 0.15)');
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, 160, 0, Math.PI * 2);
      ctx.fill();

      // Delicate concentric celestial orbital rings
      const ringRadii = [
        { r: Math.min(width, height) * 0.22, speed: 0.15, col: 'rgba(184, 167, 255, 0.12)' },
        { r: Math.min(width, height) * 0.34, speed: -0.1, col: 'rgba(105, 225, 212, 0.08)' },
        { r: Math.min(width, height) * 0.44, speed: 0.08, col: 'rgba(244, 167, 216, 0.06)' },
      ];

      ringRadii.forEach((ring, idx) => {
        ctx.strokeStyle = ring.col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, ring.r + Math.sin(t * 0.8 + idx) * 2, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Update and draw floating particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.8 + Math.sin(t * 2 + p.x) * 0.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw dynamic glowing connection lines between Center and other nodes
      const centerX = width * 0.5;
      const centerY = height * 0.5;

      nodes.forEach((node, idx) => {
        if (node.id === 'center') return;
        const nx = (node.x / 100) * width;
        const ny = (node.y / 100) * height;

        const isSelected = selectedNodeId === node.id;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + idx);

        ctx.strokeStyle = isSelected
          ? 'rgba(105, 225, 212, 0.85)'
          : node.type === 'primary'
          ? 'rgba(184, 167, 255, 0.4)'
          : 'rgba(244, 167, 216, 0.25)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.setLineDash(isSelected ? [4, 4] : [2, 4]);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small traveling memory photon along active/selected connection
        if (isSelected || idx % 2 === 0) {
          const progress = (t * 0.4 + idx * 0.25) % 1;
          const px = centerX + (nx - centerX) * progress;
          const py = centerY + (ny - centerY) * progress;

          ctx.fillStyle = '#69E1D4';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [nodes, selectedNodeId]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(23,21,34,0.35)] border border-[#B8A7FF]/20 select-none"
    >
      {/* Background Interactive WebGL / Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Floating Center Core Node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <button
          type="button"
          onClick={() => onSelectNode('center')}
          className={`relative group p-1 rounded-full transition-transform duration-300 hover:scale-110 cursor-pointer ${
            selectedNodeId === 'center' ? 'scale-105' : ''
          }`}
        >
          {/* Subtle Outer Pulsing Ring */}
          <div className="absolute -inset-2 rounded-full border border-[#B8A7FF]/40 animate-ping opacity-35" style={{ animationDuration: '4s' }} />
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-[#6D5DFB] via-[#7B6AF8] to-[#F4A7D8] p-0.5 shadow-[0_0_40px_rgba(109,93,251,0.7)] flex flex-col items-center justify-center text-white text-center relative overflow-hidden backdrop-blur-md">
            {/* Inner glass highlight */}
            <div className="absolute top-1 left-2 right-2 h-7 bg-white/20 rounded-t-full pointer-events-none" />
            <span className="text-[10px] tracking-widest uppercase text-[#8DDCFF] font-mono font-bold mb-0.5">
              ✦ CORE
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-tight px-2 leading-tight uppercase truncate max-w-[100px]">
              {centerTitle}
            </span>
            <span className="text-[9px] text-white/80 font-mono mt-1 bg-black/25 px-2 py-0.5 rounded-full">
              {totalMoments} moments
            </span>
          </div>
        </button>
      </div>

      {/* Organic Surrounding Constellation Nodes */}
      {nodes.map((node) => {
        if (node.id === 'center') return null;
        const isSelected = selectedNodeId === node.id;

        // Visual category accents
        const isActivity = node.category.toLowerCase().includes('craft') || node.category.toLowerCase().includes('engineer');
        const isChapter = node.category.toLowerCase().includes('stage') || node.category.toLowerCase().includes('demo');
        const isMilestone = node.category.toLowerCase().includes('result') || node.category.toLowerCase().includes('award');

        const accentGlow = isSelected
          ? 'shadow-[0_0_28px_#69E1D4]'
          : isActivity
          ? 'shadow-[0_0_20px_rgba(105,225,212,0.5)]'
          : isChapter
          ? 'shadow-[0_0_20px_rgba(244,167,216,0.5)]'
          : isMilestone
          ? 'shadow-[0_0_20px_rgba(141,220,255,0.5)]'
          : 'shadow-[0_0_20px_rgba(184,167,255,0.5)]';

        const nodeGradient = isSelected
          ? 'from-[#69E1D4] to-[#3B267E]'
          : isActivity
          ? 'from-[#3B267E] via-[#523E99] to-[#69E1D4]'
          : isChapter
          ? 'from-[#6D5DFB] via-[#9255B8] to-[#F4A7D8]'
          : isMilestone
          ? 'from-[#3B267E] via-[#4866B5] to-[#8DDCFF]'
          : 'from-[#6D5DFB] to-[#B8A7FF]';

        return (
          <div
            key={node.id}
            style={{
              top: `${node.y}%`,
              left: `${node.x}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <button
              type="button"
              onClick={() => onSelectNode(node.id)}
              className={`group relative flex flex-col items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                node.type === 'primary' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-13 h-13 sm:w-15 sm:h-15'
              } ${accentGlow} ${isSelected ? 'scale-115 ring-2 ring-white ring-offset-2 ring-offset-[#171522]' : 'hover:scale-110'}`}
            >
              <div
                className={`w-full h-full rounded-full bg-gradient-to-tr ${nodeGradient} p-0.5 flex flex-col items-center justify-center text-white text-center shadow-lg relative overflow-hidden`}
              >
                {/* Specular sheen */}
                <div className="absolute top-0.5 inset-x-1 h-3.5 bg-white/20 rounded-t-full pointer-events-none" />

                <span className="text-[10px] sm:text-xs font-bold leading-tight px-1 uppercase truncate max-w-[68px]">
                  {node.label}
                </span>
                {node.momentCount > 0 && (
                  <span className="text-[8px] sm:text-[9px] text-white/80 font-mono mt-0.5">
                    {node.momentCount}m
                  </span>
                )}
              </div>

              {/* Quiet Floating Tooltip / Category Label */}
              <span className="absolute -bottom-5 text-[9px] font-mono tracking-wider text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs pointer-events-none">
                {node.category}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
