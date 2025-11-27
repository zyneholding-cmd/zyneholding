import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { businessTools } from "@/data/businessTools";
import { Plus, Trash2, Link as LinkIcon, Settings, Play, Save, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ToolNode {
  id: string;
  toolId: string;
  x: number;
  y: number;
  data: any;
  config: {
    name?: string;
    description?: string;
    enabled?: boolean;
    runOnSchedule?: boolean;
    scheduleTime?: string;
  };
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'data' | 'trigger' | 'condition';
  label?: string;
}

interface Workflow {
  id: string;
  name: string;
  nodes: ToolNode[];
  connections: Connection[];
  lastModified: Date;
}

export const WorkflowCanvas = () => {
  const [nodes, setNodes] = useState<ToolNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<'data' | 'trigger' | 'condition'>('data');
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showConfig, setShowConfig] = useState(false);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = (toolId: string) => {
    const tool = businessTools.find(t => t.id === toolId);
    const newNode: ToolNode = {
      id: `node-${Date.now()}`,
      toolId,
      x: 100 + nodes.length * 30,
      y: 100 + nodes.length * 30,
      data: {},
      config: {
        name: tool?.name,
        description: tool?.description,
        enabled: true,
        runOnSchedule: false,
      }
    };
    setNodes([...nodes, newNode]);
    toast.success(`Added ${tool?.name} to workflow`);
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
        type: connectionType,
        label: connectionType === 'data' ? 'Data Flow' : connectionType === 'trigger' ? 'Triggers' : 'If Condition'
      };
      setConnections([...connections, newConnection]);
      toast.success("Tools connected successfully");
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
    const fromX = (from.x + 150) * zoom + pan.x;
    const fromY = (from.y + 60) * zoom + pan.y;
    const toX = to.x * zoom + pan.x;
    const toY = (to.y + 60) * zoom + pan.y;
    
    const midX = (fromX + toX) / 2;
    
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  };

  const saveWorkflow = () => {
    const workflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: workflowName,
      nodes,
      connections,
      lastModified: new Date(),
    };
    localStorage.setItem(`workflow-${workflow.id}`, JSON.stringify(workflow));
    toast.success("Workflow saved successfully");
  };

  const executeWorkflow = () => {
    toast.info("Executing workflow...");
    // Simulate workflow execution
    setTimeout(() => {
      toast.success("Workflow executed successfully");
    }, 2000);
  };

  const updateNodeConfig = (nodeId: string, config: Partial<ToolNode['config']>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, config: { ...node.config, ...config } } : node
    ));
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  const implementedTools = businessTools.filter(t => t.isImplemented);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Controls */}
      <div className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64"
            placeholder="Workflow name"
          />
          <Badge variant="secondary">{nodes.length} nodes</Badge>
          <Badge variant="secondary">{connections.length} connections</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setZoom(zoom - 0.1)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={() => setZoom(zoom + 0.1)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={saveWorkflow}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" onClick={executeWorkflow}>
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <div className="w-64 border-r bg-card overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm mb-2">Connection Type</h3>
            <Select value={connectionType} onValueChange={(v: any) => setConnectionType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data">Data Flow</SelectItem>
                <SelectItem value="trigger">Trigger</SelectItem>
                <SelectItem value="condition">Condition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-4">
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
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative bg-muted/20 overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          {/* SVG for connections */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full">
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              const color = conn.type === 'data' ? 'hsl(var(--primary))' : 
                           conn.type === 'trigger' ? 'hsl(var(--warning))' : 
                           'hsl(var(--success))';
              
              return (
                <g key={conn.id}>
                  <path
                    d={getConnectionPath(fromNode, toNode)}
                    stroke={color}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                    className="animate-dash"
                  />
                  <text
                    x={(fromNode.x + toNode.x) / 2 * zoom + pan.x}
                    y={(fromNode.y + toNode.y) / 2 * zoom + pan.y - 10}
                    fill="currentColor"
                    fontSize="12"
                    className="pointer-events-none"
                  >
                    {conn.label}
                  </text>
                </g>
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
            const isDisabled = !node.config.enabled;
            
            return (
              <Card
                key={node.id}
                className={cn(
                  "absolute w-64 cursor-move select-none transition-all",
                  isSelected && "ring-2 ring-primary shadow-lg",
                  isConnecting && "ring-2 ring-warning",
                  isDisabled && "opacity-50"
                )}
                style={{
                  left: node.x * zoom + pan.x,
                  top: node.y * zoom + pan.y,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
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
                      <div className="font-semibold text-sm truncate">
                        {node.config.name || tool.name}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {tool.category}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node.id);
                        setShowConfig(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  {node.config.description && (
                    <p className="text-xs text-muted-foreground mb-3">{node.config.description}</p>
                  )}

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
                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>Connections: {connections.filter(c => c.from === node.id || c.to === node.id).length}</span>
                      {node.config.runOnSchedule && (
                        <Badge variant="outline" className="text-xs">
                          Scheduled
                        </Badge>
                      )}
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

      {/* Configuration Panel */}
      <Sheet open={showConfig} onOpenChange={setShowConfig}>
        <SheetContent className="w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Node Configuration</SheetTitle>
          </SheetHeader>
          
          {selectedNodeData && (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Node Name</Label>
                <Input
                  value={selectedNodeData.config.name || ''}
                  onChange={(e) => updateNodeConfig(selectedNodeData.id, { name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedNodeData.config.description || ''}
                  onChange={(e) => updateNodeConfig(selectedNodeData.id, { description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Node</Label>
                  <input
                    type="checkbox"
                    checked={selectedNodeData.config.enabled}
                    onChange={(e) => updateNodeConfig(selectedNodeData.id, { enabled: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Run on Schedule</Label>
                  <input
                    type="checkbox"
                    checked={selectedNodeData.config.runOnSchedule}
                    onChange={(e) => updateNodeConfig(selectedNodeData.id, { runOnSchedule: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                {selectedNodeData.config.runOnSchedule && (
                  <div className="space-y-2">
                    <Label>Schedule Time</Label>
                    <Input
                      type="time"
                      value={selectedNodeData.config.scheduleTime || ''}
                      onChange={(e) => updateNodeConfig(selectedNodeData.id, { scheduleTime: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Data Preview</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Incoming:</span>
                    <span>{connections.filter(c => c.to === selectedNodeData.id).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outgoing:</span>
                    <span>{connections.filter(c => c.from === selectedNodeData.id).length}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                variant="destructive"
                onClick={() => {
                  deleteNode(selectedNodeData.id);
                  setShowConfig(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Node
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};