import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { businessTools } from "@/data/businessTools";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolNode {
  id: string;
  toolId: string;
  x: number;
  y: number;
  data: any;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

export const WorkflowCanvas = () => {
  const [nodes, setNodes] = useState<ToolNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = (toolId: string) => {
    const newNode: ToolNode = {
      id: `node-${Date.now()}`,
      toolId,
      x: 100,
      y: 100,
      data: {},
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
  };

  const startConnection = (nodeId: string) => {
    setConnectingFrom(nodeId);
  };

  const completeConnection = (toNodeId: string) => {
    if (connectingFrom && connectingFrom !== toNodeId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectingFrom,
        to: toNodeId,
      };
      setConnections([...connections, newConnection]);
    }
    setConnectingFrom(null);
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y,
      });
      setDraggedNode(nodeId);
      setSelectedNode(nodeId);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      
      setNodes(prev => prev.map(node => 
        node.id === draggedNode 
          ? { ...node, x: newX, y: newY }
          : node
      ));
    }
  }, [draggedNode, dragOffset]);

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const getConnectionPath = (from: ToolNode, to: ToolNode) => {
    const fromX = from.x + 150;
    const fromY = from.y + 60;
    const toX = to.x;
    const toY = to.y + 60;
    
    const midX = (fromX + toX) / 2;
    
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  };

  const implementedTools = businessTools.filter(t => t.isImplemented);

  return (
    <div className="h-screen flex">
      {/* Toolbar */}
      <div className="w-64 border-r bg-card p-4">
        <h3 className="font-semibold mb-4 text-sm">Available Tools</h3>
        <div className="space-y-2">
          {implementedTools.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => addNode(tool.id)}
                className="w-full p-3 rounded-lg border bg-background hover:bg-accent transition-colors text-left flex items-center gap-3"
              >
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center",
                  `bg-${tool.color}/10`
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{tool.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative bg-muted/20 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full">
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;
            
            return (
              <path
                key={conn.id}
                d={getConnectionPath(fromNode, toNode)}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                className="animate-dash"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const tool = businessTools.find(t => t.id === node.toolId);
          if (!tool) return null;
          
          const Icon = tool.icon;
          const isSelected = selectedNode === node.id;
          const isConnecting = connectingFrom === node.id;
          
          return (
            <Card
              key={node.id}
              className={cn(
                "absolute w-64 cursor-move select-none transition-all",
                isSelected && "ring-2 ring-primary shadow-lg",
                isConnecting && "ring-2 ring-blue-500"
              )}
              style={{
                left: node.x,
                top: node.y,
              }}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    `bg-${tool.color}/10`
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{tool.name}</div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {tool.category}
                    </Badge>
                  </div>
                </div>

                {/* Connection Points */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      startConnection(node.id);
                    }}
                    className="text-xs"
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectingFrom) {
                        completeConnection(node.id);
                      } else {
                        deleteNode(node.id);
                      }
                    }}
                    className="text-xs"
                  >
                    {connectingFrom ? (
                      <>
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Link Here
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>

                {/* Data Preview */}
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    Connected: {connections.filter(c => c.from === node.id || c.to === node.id).length}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Building Your Workflow</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Add tools from the left panel and connect them together to create automated workflows
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};