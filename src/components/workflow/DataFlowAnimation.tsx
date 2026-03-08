import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DataPacket {
  id: string;
  connectionId: string;
  progress: number;
  data: Record<string, any>;
}

interface Props {
  connections: { id: string; from: string; to: string; type: string }[];
  nodes: { id: string; x: number; y: number }[];
  activeConnections: string[];
  zoom: number;
  pan: { x: number; y: number };
}

export const DataFlowAnimation = ({ connections, nodes, activeConnections, zoom, pan }: Props) => {
  const [packets, setPackets] = useState<DataPacket[]>([]);

  useEffect(() => {
    if (activeConnections.length === 0) {
      setPackets([]);
      return;
    }

    const interval = setInterval(() => {
      setPackets(prev => {
        const updated = prev
          .map(p => ({ ...p, progress: p.progress + 2 }))
          .filter(p => p.progress <= 100);

        // Spawn new packets for active connections
        activeConnections.forEach(connId => {
          if (!updated.some(p => p.connectionId === connId && p.progress < 30)) {
            updated.push({
              id: `pkt-${Date.now()}-${Math.random()}`,
              connectionId: connId,
              progress: 0,
              data: {},
            });
          }
        });

        return updated;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [activeConnections]);

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 5 }}>
      {packets.map(packet => {
        const conn = connections.find(c => c.id === packet.connectionId);
        if (!conn) return null;
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return null;

        const fromX = (fromNode.x + 128) * zoom + pan.x;
        const fromY = (fromNode.y + 50) * zoom + pan.y;
        const toX = (toNode.x + 128) * zoom + pan.x;
        const toY = (toNode.y + 50) * zoom + pan.y;

        const t = packet.progress / 100;
        const cx = fromX + (toX - fromX) * t;
        const cy = fromY + (toY - fromY) * t;

        return (
          <g key={packet.id}>
            <circle cx={cx} cy={cy} r={5 * zoom} fill="hsl(var(--primary))" opacity={0.9}>
              <animate attributeName="r" values={`${4 * zoom};${7 * zoom};${4 * zoom}`} dur="0.6s" repeatCount="indefinite" />
            </circle>
            <circle cx={cx} cy={cy} r={10 * zoom} fill="hsl(var(--primary))" opacity={0.2}>
              <animate attributeName="r" values={`${8 * zoom};${14 * zoom};${8 * zoom}`} dur="0.6s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
};
