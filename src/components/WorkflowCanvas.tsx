import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { businessTools } from "@/data/businessTools";
import {
  Plus, Trash2, Link as LinkIcon, Settings, Play, Save,
  ZoomIn, ZoomOut, Maximize, Square, Activity, Search,
  ArrowRight, Unlink, RotateCcw, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DataFlowAnimation } from "./workflow/DataFlowAnimation";
import { NodeDataPreview, NodeStatusIndicator, type NodeStatus } from "./workflow/NodeDataPreview";

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
  type: "data" | "trigger" | "condition";
  label?: string;
}

export const WorkflowCanvas = () => {
  const [nodes, setNodes] = useState<ToolNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<"data" | "trigger" | "condition">("data");
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showConfig, setShowConfig] = useState(false);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [searchTool, setSearchTool] = useState("");

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});
  const [nodeOutputData, setNodeOutputData] = useState<Record<string, Record<string, any>>>({});
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const executionRef = useRef(false);

  const implementedTools = businessTools.filter(t => t.isImplemented);
  const filteredTools = implementedTools.filter(t =>
    t.name.toLowerCase().includes(searchTool.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTool.toLowerCase())
  );

  // Group by category
  const toolsByCategory = filteredTools.reduce<Record<string, typeof filteredTools>>((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const addNode = (toolId: string) => {
    const tool = businessTools.find(t => t.id === toolId);
    if (!tool) return;
    const offset = nodes.length * 40;
    const newNode: ToolNode = {
      id: `node-${Date.now()}`,
      toolId,
      x: 300 + offset,
      y: 150 + (offset % 200),
      data: {},
      config: {
        name: tool.name,
        description: tool.description,
        enabled: true,
        runOnSchedule: false,
      },
    };
    setNodes(prev => [...prev, newNode]);
    toast.success(`Added ${tool.name}`);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const startConnection = (nodeId: string) => {
    if (connectingFrom === nodeId) {
      setConnectingFrom(null);
      toast.info("Connection cancelled");
    } else {
      setConnectingFrom(nodeId);
      toast.info("Click 'Link Here' on another node to connect");
    }
  };

  const completeConnection = (toNodeId: string) => {
    if (!connectingFrom || connectingFrom === toNodeId) return;
    // Prevent duplicate connections
    if (connections.some(c => c.from === connectingFrom && c.to === toNodeId)) {
      toast.error("Connection already exists");
      setConnectingFrom(null);
      return;
    }
    const fromTool = businessTools.find(t => t.id === nodes.find(n => n.id === connectingFrom)?.toolId);
    const toTool = businessTools.find(t => t.id === nodes.find(n => n.id === toNodeId)?.toolId);
    const label = connectionType === "data" ? `${fromTool?.name} → ${toTool?.name}` :
      connectionType === "trigger" ? "Triggers" : "Condition";

    setConnections(prev => [...prev, {
      id: `conn-${Date.now()}`,
      from: connectingFrom,
      to: toNodeId,
      type: connectionType,
      label,
    }]);
    setConnectingFrom(null);
    toast.success(`Connected ${fromTool?.name} → ${toTool?.name}`);
  };

  const deleteConnection = (connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
    toast.success("Connection removed");
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left - node.x * zoom - pan.x, y: e.clientY - rect.top - node.y * zoom - pan.y });
      setDraggedNode(nodeId);
      setSelectedNode(nodeId);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - dragOffset.x - pan.x) / zoom;
      const newY = (e.clientY - rect.top - dragOffset.y - pan.y) / zoom;
      setNodes(prev => prev.map(node =>
        node.id === draggedNode ? { ...node, x: Math.max(0, newX), y: Math.max(0, newY) } : node
      ));
    }
  }, [draggedNode, dragOffset, zoom, pan]);

  const handleMouseUp = () => setDraggedNode(null);

  const getConnectionPath = (from: ToolNode, to: ToolNode) => {
    const fromX = (from.x + 256) * zoom + pan.x;
    const fromY = (from.y + 50) * zoom + pan.y;
    const toX = to.x * zoom + pan.x;
    const toY = (to.y + 50) * zoom + pan.y;
    const dx = Math.abs(toX - fromX) * 0.5;
    return `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;
  };

  // --- Execution Engine ---
  const generateMockData = (toolId: string): Record<string, any> => {
    const dataMap: Record<string, Record<string, any>> = {
      sales: { total_sales: "PKR 154,200", orders: 42, avg_order: "PKR 3,671" },
      products: { products: 156, low_stock: 8, categories: 12 },
      analytics: { visitors: "2,341", conversion: "3.2%", bounce_rate: "42%" },
      customers: { total: 892, new_this_month: 34, retention: "96%" },
      tasks: { total: 45, completed: 32, overdue: 3 },
      calendar: { events_today: 3, upcoming: 8, meetings: 2 },
      documents: { total_files: 234, recent: 12, storage: "1.2 GB" },
      team: { members: 8, active: 6, pending_invites: 2 },
      workflow: { active_flows: 3, runs_today: 12, success_rate: "98%" },
      overview: { revenue: "PKR 1.2M", growth: "+12%", profit_margin: "28%" },
      invoices: { total: 67, pending: 12, overdue: 3 },
    };
    return dataMap[toolId] || { records: Math.floor(Math.random() * 100 + 10), status: "active", processed: true };
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) { toast.error("Add nodes to execute"); return; }
    if (connections.length === 0 && nodes.length > 1) { toast.error("Connect nodes first"); return; }

    setIsExecuting(true);
    executionRef.current = true;
    setExecutionLog([`▶ Starting workflow "${workflowName}"...`]);
    setNodeOutputData({});

    // Set all to waiting
    const statuses: Record<string, NodeStatus> = {};
    nodes.forEach(n => { statuses[n.id] = "waiting"; });
    setNodeStatuses({ ...statuses });

    // Find execution order (topological sort)
    const startNodes = nodes.filter(n => !connections.some(c => c.to === n.id));
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      order.push(nodeId);
      connections.filter(c => c.from === nodeId).forEach(c => visit(c.to));
    };
    startNodes.forEach(n => visit(n.id));
    // Add any unvisited nodes
    nodes.forEach(n => { if (!visited.has(n.id)) order.push(n.id); });

    // Execute nodes sequentially
    for (const nodeId of order) {
      if (!executionRef.current) break;

      const node = nodes.find(n => n.id === nodeId);
      if (!node || !node.config.enabled) continue;

      const tool = businessTools.find(t => t.id === node.toolId);

      // Activate incoming connections
      const incomingConns = connections.filter(c => c.to === nodeId);
      setActiveConnections(incomingConns.map(c => c.id));

      setNodeStatuses(prev => ({ ...prev, [nodeId]: "processing" }));
      setExecutionLog(prev => [...prev, `⚡ Processing ${tool?.name || nodeId}...`]);

      await new Promise(r => setTimeout(r, 1200));

      if (!executionRef.current) break;

      const data = generateMockData(node.toolId);
      setNodeOutputData(prev => ({ ...prev, [nodeId]: data }));
      setNodeStatuses(prev => ({ ...prev, [nodeId]: "completed" }));
      setActiveConnections([]);
      setExecutionLog(prev => [...prev, `✅ ${tool?.name} completed`]);

      await new Promise(r => setTimeout(r, 300));
    }

    if (executionRef.current) {
      setExecutionLog(prev => [...prev, `🎉 Workflow completed successfully!`]);
      toast.success("Workflow executed successfully!");
    }
    setIsExecuting(false);
    executionRef.current = false;
    setActiveConnections([]);
  };

  const stopWorkflow = () => {
    executionRef.current = false;
    setIsExecuting(false);
    setActiveConnections([]);
    setExecutionLog(prev => [...prev, `⏹ Workflow stopped by user`]);
    toast.info("Workflow stopped");
  };

  const resetWorkflow = () => {
    setNodeStatuses({});
    setNodeOutputData({});
    setActiveConnections([]);
    setExecutionLog([]);
  };

  const saveWorkflow = () => {
    const workflow = { name: workflowName, nodes, connections, savedAt: new Date().toISOString() };
    localStorage.setItem("workflow-current", JSON.stringify(workflow));
    toast.success("Workflow saved");
  };

  // Load saved workflow
  useEffect(() => {
    const saved = localStorage.getItem("workflow-current");
    if (saved) {
      try {
        const wf = JSON.parse(saved);
        if (wf.nodes?.length) {
          setNodes(wf.nodes);
          setConnections(wf.connections || []);
          setWorkflowName(wf.name || "Untitled Workflow");
        }
      } catch {}
    }
  }, []);

  const updateNodeConfig = (nodeId: string, config: Partial<ToolNode["config"]>) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n));
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);
  const connTypeColors = { data: "hsl(var(--primary))", trigger: "#f59e0b", condition: "#10b981" };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <Input
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              className="w-52 h-8 text-sm font-medium border-none bg-transparent hover:bg-muted/50 focus:bg-muted/50 px-2"
            />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Badge variant="outline" className="text-xs font-normal gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            {nodes.length} nodes
          </Badge>
          <Badge variant="outline" className="text-xs font-normal gap-1">
            <ArrowRight className="h-3 w-3" />
            {connections.length} connections
          </Badge>
          {isExecuting && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1 animate-pulse">
              <Activity className="h-3 w-3" />
              Running
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-muted rounded-md p-0.5 gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
              <Maximize className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6" />
          {(Object.keys(nodeStatuses).length > 0) && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={resetWorkflow}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />Reset
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={saveWorkflow}>
            <Save className="h-3.5 w-3.5 mr-1" />Save
          </Button>
          {isExecuting ? (
            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={stopWorkflow}>
              <Square className="h-3.5 w-3.5 mr-1" />Stop
            </Button>
          ) : (
            <Button size="sm" className="h-8 text-xs" onClick={executeWorkflow}>
              <Play className="h-3.5 w-3.5 mr-1" />Run Workflow
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tools */}
        <div className="w-60 border-r bg-card flex flex-col shrink-0">
          <div className="p-3 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchTool}
                onChange={e => setSearchTool(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <div className="flex gap-1">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Connection:</Label>
              <Select value={connectionType} onValueChange={(v: any) => setConnectionType(v)}>
                <SelectTrigger className="h-6 text-[11px] border-none bg-muted/50 px-2 w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">Data Flow</SelectItem>
                  <SelectItem value="trigger">Trigger</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-3">
              {Object.entries(toolsByCategory).map(([category, tools]) => (
                <div key={category}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">{category}</p>
                  <div className="space-y-0.5">
                    {tools.map(tool => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => addNode(tool.id)}
                          className="w-full p-2 rounded-md hover:bg-accent transition-colors text-left flex items-center gap-2.5 group"
                        >
                          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{tool.name}</div>
                          </div>
                          <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          <div
            ref={canvasRef}
            className="flex-1 relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={() => { if (!draggedNode) setSelectedNode(null); }}
            style={{
              backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
              backgroundColor: "hsl(var(--muted) / 0.3)",
            }}
          >
            {/* Connection Lines SVG */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 1 }}>
              <defs>
                <marker id="arrow-data" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M 0 0 L 8 3 L 0 6 Z" fill="hsl(var(--primary))" opacity="0.6" />
                </marker>
                <marker id="arrow-trigger" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M 0 0 L 8 3 L 0 6 Z" fill="#f59e0b" opacity="0.6" />
                </marker>
                <marker id="arrow-condition" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M 0 0 L 8 3 L 0 6 Z" fill="#10b981" opacity="0.6" />
                </marker>
              </defs>
              {connections.map(conn => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;
                const path = getConnectionPath(fromNode, toNode);
                const color = connTypeColors[conn.type];
                const isActive = activeConnections.includes(conn.id);

                return (
                  <g key={conn.id} className="cursor-pointer" onClick={() => deleteConnection(conn.id)} style={{ pointerEvents: "all" }}>
                    {/* Hit area */}
                    <path d={path} stroke="transparent" strokeWidth="16" fill="none" />
                    {/* Visible line */}
                    <path
                      d={path}
                      stroke={color}
                      strokeWidth={isActive ? 3 : 2}
                      fill="none"
                      strokeDasharray={conn.type === "condition" ? "6,4" : undefined}
                      opacity={isActive ? 1 : 0.5}
                      markerEnd={`url(#arrow-${conn.type})`}
                      className="transition-all duration-300"
                    />
                    {isActive && (
                      <path
                        d={path}
                        stroke={color}
                        strokeWidth="6"
                        fill="none"
                        opacity="0.15"
                        className="animate-pulse"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Data Flow Packets */}
            <DataFlowAnimation
              connections={connections}
              nodes={nodes}
              activeConnections={activeConnections}
              zoom={zoom}
              pan={pan}
            />

            {/* Nodes */}
            {nodes.map(node => {
              const tool = businessTools.find(t => t.id === node.toolId);
              if (!tool) return null;
              const Icon = tool.icon;
              const isSelected = selectedNode === node.id;
              const isLinking = connectingFrom === node.id;
              const status = nodeStatuses[node.id] || "idle";
              const outputData = nodeOutputData[node.id] || null;
              const connCount = connections.filter(c => c.from === node.id || c.to === node.id).length;

              return (
                <Card
                  key={node.id}
                  className={cn(
                    "absolute w-64 select-none transition-shadow duration-200 border",
                    draggedNode === node.id ? "cursor-grabbing shadow-xl z-20" : "cursor-grab z-10",
                    isSelected && "ring-2 ring-primary/50 shadow-lg",
                    isLinking && "ring-2 ring-amber-400/70",
                    !node.config.enabled && "opacity-40",
                    status === "processing" && "ring-2 ring-primary shadow-lg shadow-primary/10",
                    status === "completed" && "ring-1 ring-green-500/40",
                    status === "error" && "ring-1 ring-destructive/40"
                  )}
                  style={{
                    left: node.x * zoom + pan.x,
                    top: node.y * zoom + pan.y,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                  onMouseDown={e => handleNodeMouseDown(node.id, e)}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3 relative">
                    <NodeStatusIndicator status={status} />

                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate leading-tight">{node.config.name || tool.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{tool.category}</div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        onClick={e => { e.stopPropagation(); setSelectedNode(node.id); setShowConfig(true); }}
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        variant={isLinking ? "default" : "outline"}
                        className="h-7 text-[11px] flex-1"
                        onClick={e => { e.stopPropagation(); startConnection(node.id); }}
                      >
                        <LinkIcon className="h-3 w-3 mr-1" />
                        {isLinking ? "Cancel" : "Connect"}
                      </Button>
                      {connectingFrom && connectingFrom !== node.id ? (
                        <Button
                          size="sm"
                          className="h-7 text-[11px] flex-1"
                          onClick={e => { e.stopPropagation(); completeConnection(node.id); }}
                        >
                          <ChevronRight className="h-3 w-3 mr-1" />Link Here
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] text-destructive hover:text-destructive"
                          onClick={e => { e.stopPropagation(); deleteNode(node.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Data Preview */}
                    <NodeDataPreview data={outputData} status={status} />

                    {/* Connection count */}
                    {connCount > 0 && status === "idle" && (
                      <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{connCount} connection{connCount > 1 ? "s" : ""}</span>
                        {node.config.runOnSchedule && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1">Scheduled</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            {/* Empty State */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">Build Your Workflow</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add tools from the left panel and connect them to automate data flows between your business tools.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">1. Add Nodes</Badge>
                    <ArrowRight className="h-3 w-3" />
                    <Badge variant="outline" className="text-[10px]">2. Connect</Badge>
                    <ArrowRight className="h-3 w-3" />
                    <Badge variant="outline" className="text-[10px]">3. Run</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Execution Log */}
          {executionLog.length > 0 && (
            <div className="h-28 border-t bg-card shrink-0">
              <div className="px-3 py-1.5 border-b flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Execution Log</span>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => setExecutionLog([])}>Clear</Button>
              </div>
              <ScrollArea className="h-[calc(100%-28px)]">
                <div className="p-2 space-y-0.5 font-mono text-[11px]">
                  {executionLog.map((log, i) => (
                    <div key={i} className="text-muted-foreground">{log}</div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Config Sheet */}
      <Sheet open={showConfig} onOpenChange={setShowConfig}>
        <SheetContent className="w-[360px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">Node Settings</SheetTitle>
          </SheetHeader>
          {selectedNodeData && (() => {
            const tool = businessTools.find(t => t.id === selectedNodeData.toolId);
            const Icon = tool?.icon;
            return (
              <div className="space-y-5 mt-5">
                {/* Preview */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {Icon && (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{selectedNodeData.config.name}</div>
                    <div className="text-xs text-muted-foreground">{tool?.category}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={selectedNodeData.config.name || ""}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { name: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={selectedNodeData.config.description || ""}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { description: e.target.value })}
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Enabled</Label>
                    <p className="text-[10px] text-muted-foreground">Include in execution</p>
                  </div>
                  <Switch
                    checked={selectedNodeData.config.enabled}
                    onCheckedChange={v => updateNodeConfig(selectedNodeData.id, { enabled: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Scheduled</Label>
                    <p className="text-[10px] text-muted-foreground">Run automatically</p>
                  </div>
                  <Switch
                    checked={selectedNodeData.config.runOnSchedule}
                    onCheckedChange={v => updateNodeConfig(selectedNodeData.id, { runOnSchedule: v })}
                  />
                </div>
                {selectedNodeData.config.runOnSchedule && (
                  <div className="space-y-2">
                    <Label className="text-xs">Schedule Time</Label>
                    <Input
                      type="time"
                      value={selectedNodeData.config.scheduleTime || ""}
                      onChange={e => updateNodeConfig(selectedNodeData.id, { scheduleTime: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                <Separator />

                {/* Connection Info */}
                <div>
                  <Label className="text-xs">Connections</Label>
                  <div className="mt-2 space-y-1.5">
                    {connections.filter(c => c.from === selectedNodeData.id || c.to === selectedNodeData.id).map(conn => {
                      const otherNodeId = conn.from === selectedNodeData.id ? conn.to : conn.from;
                      const otherNode = nodes.find(n => n.id === otherNodeId);
                      const otherTool = otherNode ? businessTools.find(t => t.id === otherNode.toolId) : null;
                      const direction = conn.from === selectedNodeData.id ? "→" : "←";
                      return (
                        <div key={conn.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs">
                          <span>{direction} {otherTool?.name || "Unknown"}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[9px] h-4">{conn.type}</Badge>
                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => deleteConnection(conn.id)}>
                              <Unlink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {connections.filter(c => c.from === selectedNodeData.id || c.to === selectedNodeData.id).length === 0 && (
                      <p className="text-xs text-muted-foreground">No connections yet</p>
                    )}
                  </div>
                </div>

                {/* Output Data */}
                {nodeOutputData[selectedNodeData.id] && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-xs">Last Output</Label>
                      <div className="mt-2 p-2.5 rounded-md bg-muted/50 font-mono text-[11px] space-y-0.5">
                        {Object.entries(nodeOutputData[selectedNodeData.id]).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-muted-foreground">{k}</span>
                            <span className="font-medium">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => { deleteNode(selectedNodeData.id); setShowConfig(false); }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete Node
                </Button>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};
