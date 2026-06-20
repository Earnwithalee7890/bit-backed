import React, { useRef, useEffect, useState } from 'react';
import { useStacks } from '../context/StacksContext';

interface Node3D {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  reputation: number;
  color: string;
  vx: number;
  vy: number;
  vz: number;
}

interface Edge3D {
  source: string;
  target: string;
}

export const ThreeDGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { talents } = useStacks();
  const [nodes, setNodes] = useState<Node3D[]>([]);
  const [edges, setEdges] = useState<Edge3D[]>([]);
  
  const rotationRef = useRef({ x: 0.005, y: 0.005, mouseX: 0, mouseY: 0, isDragging: false });

  // Initialize nodes based on talents
  useEffect(() => {
    // Generate nodes with 3D positions
    const newNodes: Node3D[] = talents.map((t, idx) => {
      // Position nodes in a sphere configuration
      const phi = Math.acos(-1 + (2 * idx) / talents.length);
      const theta = Math.sqrt(talents.length * Math.PI) * phi;
      const radius = 100;

      return {
        id: t.address,
        label: t.username,
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        reputation: t.reputationScore,
        color: t.isVerified ? '#00bfff' : '#8a2be2',
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
      };
    });

    // Add extra decorative dust nodes
    for (let i = 0; i < 30; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 60 + Math.random() * 80;
      newNodes.push({
        id: `dust-${i}`,
        label: '',
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        reputation: 10,
        color: '#64748b',
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        vz: (Math.random() - 0.5) * 0.05,
      });
    }

    // Connect some random nodes
    const newEdges: Edge3D[] = [];
    talents.forEach((t) => {
      // Connect each main talent to 1 or 2 other talents
      const others = talents.filter((ot) => ot.address !== t.address);
      if (others.length > 0) {
        const rand = others[Math.floor(Math.random() * others.length)];
        newEdges.push({ source: t.address, target: rand.address });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [talents]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const focalLength = 300;
    const center = { x: 0, y: 0 };

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || 500;
      canvas.height = rect?.height || 350;
      center.x = canvas.width / 2;
      center.y = canvas.height / 2;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Rotation parameters
    let rx = 0.003;
    let ry = 0.003;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - center.x;
      const y = e.clientY - rect.top - center.y;
      
      if (rotationRef.current.isDragging) {
        const dx = x - rotationRef.current.mouseX;
        const dy = y - rotationRef.current.mouseY;
        ry = dx * 0.005;
        rx = -dy * 0.005;
      } else {
        // Slow hover rotation effect
        ry = x * 0.00002;
        rx = -y * 0.00002;
      }
      rotationRef.current.mouseX = x;
      rotationRef.current.mouseY = y;
    };

    const handleMouseDown = () => {
      rotationRef.current.isDragging = true;
    };

    const handleMouseUp = () => {
      rotationRef.current.isDragging = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rotate nodes in 3D
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      nodes.forEach((node) => {
        // Apply velocity (jitter animation)
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Bounce back inside a boundary sphere
        const dist = Math.sqrt(node.x*node.x + node.y*node.y + node.z*node.z);
        if (dist > 180) {
          node.vx *= -1;
          node.vy *= -1;
          node.vz *= -1;
        }

        // Rotate Y
        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.x * sinY + node.z * cosY;

        // Rotate X
        let y2 = node.y * cosX - z1 * sinX;
        let z2 = node.y * sinX + z1 * cosX;

        node.x = x1;
        node.y = y2;
        node.z = z2;
      });

      // Sort nodes by depth (z-index) so farther nodes are drawn behind closer nodes
      const sortedNodes = [...nodes].sort((a, b) => b.z - a.z);

      // Draw edges
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (sourceNode && targetNode) {
          const sz1 = sourceNode.z + focalLength;
          const sz2 = targetNode.z + focalLength;

          if (sz1 > 50 && sz2 > 50) {
            const scale1 = focalLength / sz1;
            const scale2 = focalLength / sz2;

            const sx = center.x + sourceNode.x * scale1;
            const sy = center.y + sourceNode.y * scale1;
            const tx = center.x + targetNode.x * scale2;
            const ty = center.y + targetNode.y * scale2;

            const avgDepth = (sourceNode.z + targetNode.z) / 2;
            // Farther nodes are more transparent
            const alpha = Math.max(0.05, Math.min(0.6, (150 - avgDepth) / 300));

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = `rgba(138, 43, 226, ${alpha})`;
            ctx.lineWidth = 1 * Math.min(scale1, scale2);
            ctx.stroke();
          }
        }
      });

      // Draw nodes
      sortedNodes.forEach((node) => {
        const sz = node.z + focalLength;
        if (sz <= 50) return;

        const scale = focalLength / sz;
        const x = center.x + node.x * scale;
        const y = center.y + node.y * scale;

        // Size proportional to reputation score and perspective scale
        const sizeMultiplier = Math.max(1.5, Math.min(5, Math.log10(node.reputation)));
        const radius = Math.max(1, 3 * scale * sizeMultiplier);
        
        const alpha = Math.max(0.1, Math.min(1.0, (150 - node.z) / 200));

        // Draw node body
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = node.label ? 8 : 0;
        ctx.shadowColor = node.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

        // Draw node labels for major nodes
        if (node.label && scale > 0.6) {
          ctx.font = `${Math.round(11 * scale)}px Outfit, sans-serif`;
          ctx.fillStyle = `rgba(248, 250, 252, ${Math.min(1.0, alpha + 0.2)})`;
          ctx.fillText(`@${node.label}`, x + radius + 4, y + 4);
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [nodes, edges]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '320px', overflow: 'hidden' }}>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', cursor: 'grab', width: '100%', height: '100%' }} 
        title="Interactive 3D Backing Graph - Drag to Rotate"
      />
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.7rem',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        pointerEvents: 'none'
      }}>
        Reputation Network Graph (3D Interactive Canvas)
      </div>
    </div>
  );
};
