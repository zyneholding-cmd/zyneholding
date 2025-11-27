import { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

interface IconRendererProps {
  Icon: LucideIcon;
  className?: string;
  use3D?: boolean;
  color?: string;
}

export const IconRenderer = ({ Icon, className, use3D = false, color }: IconRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!use3D || !canvasRef.current) return;

    // Simple 3D effect using canvas transformations
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const time = Date.now() * 0.001;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Create 3D rotation effect
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.sin(time) * 0.1);
      ctx.scale(1 + Math.sin(time * 2) * 0.05, 1 + Math.cos(time * 2) * 0.05);
      
      // Draw gradient background
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, canvas.width / 2);
      gradient.addColorStop(0, color || '#4F46E5');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      
      ctx.restore();
      requestAnimationFrame(animate);
    };

    animate();
  }, [use3D, color]);

  if (use3D) {
    return (
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={48}
          height={48}
          className="absolute inset-0 opacity-30"
        />
        <Icon className={className} />
      </div>
    );
  }

  return <Icon className={className} />;
};