/**
 * Admin Infrastructure Page - Unified Proxmox Servers & Nodes Management.
 * Sprint 3 - Consolidated admin view
 *
 * Shows servers in expandable cards with inline node health monitoring.
 * Server → Nodes → VMs hierarchy in a single page.
 */

import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  Activity,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreVertical,
  Play,
  PlusCircle,
  Power,
  RefreshCw,
  Server,
  Trash2,
  X,
  Shield,
  Monitor,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import client from '@/api/client';
import { adminApi } from '@/api/vm.api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ProxmoxNode, ProxmoxServerAdmin, ProxmoxVM } from '@/types/vm.types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Admin', href: '/admin/infrastructure' },
  { title: 'Infrastructure', href: '/admin/infrastructure' },
];

interface ProxmoxServerFormData {
  name: string;
  description: string;
  host: string;
  port: number;
  realm: string;
  token_id: string;
  token_secret: string;
  verify_ssl: boolean;
}

const initialFormData: ProxmoxServerFormData = {
  name: '',
  description: '',
  host: '',
  port: 8006,
  realm: 'pam',
  token_id: '',
  token_secret: '',
  verify_ssl: true,
};

// ─── Helper Functions ───

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getLoadColor(percent: number): string {
  if (percent < 60) return 'bg-green-500';
  if (percent < 80) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(0)} MB`;
}

// ─── Sub Components ───

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  const color = getLoadColor(percent);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

interface NodeCardProps {
  node: ProxmoxNode;
  onSelectNode: (nodeId: number) => void;
  selectedNodeId: number | null;
}

function NodeCard({ node, onSelectNode, selectedNodeId }: NodeCardProps) {
  const isSelected = selectedNodeId === node.id;
  const statusColor = node.status === 'online' ? 'bg-green-500' : node.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500';
  const textColor = node.status === 'online' ? 'text-green-600' : node.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600';

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-secondary/50 ${isSelected ? 'ring-2 ring-secondary border-secondary' : ''}`}
      onClick={() => onSelectNode(node.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{node.name}</span>
        </div>
        <Badge variant="outline" className={`${textColor} border-current capitalize`}>
          <span className={`w-2 h-2 rounded-full mr-1.5 ${statusColor}`} />
          {node.status}
        </Badge>
      </div>

      {node.status === 'online' && (
        <div className="space-y-2">
          <ProgressBar value={node.cpu_percent ?? 0} max={100} label="CPU" />
          <ProgressBar
            value={node.ram_used_mb ?? 0}
            max={node.ram_total_mb ?? 1}
            label={`RAM ${Math.round((node.ram_used_mb ?? 0) / 1024)}/${Math.round((node.ram_total_mb ?? 0) / 1024)} GB`}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>VMs: {node.active_vm_count ?? 0}</span>
            {node.uptime_seconds !== undefined && <span>Uptime: {formatUptime(node.uptime_seconds)}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

interface VMsPanelProps {
  nodeId: number;
  nodeName: string;
  onClose: () => void;
}

function VMsPanel({ nodeId, nodeName, onClose }: VMsPanelProps) {
  const [vms, setVms] = useState<ProxmoxVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchVMs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getNodeVMs(nodeId);
      setVms(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load VMs');
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    fetchVMs();
  }, [fetchVMs]);

  const handleAction = async (vmid: number, action: 'start' | 'stop' | 'reboot' | 'shutdown') => {
    setActionLoading(vmid);
    try {
      switch (action) {
        case 'start':
          await adminApi.startVM(nodeId, vmid);
          break;
        case 'stop':
          await adminApi.stopVM(nodeId, vmid);
          break;
        case 'reboot':
          await adminApi.rebootVM(nodeId, vmid);
          break;
        case 'shutdown':
          await adminApi.shutdownVM(nodeId, vmid);
          break;
      }
      setTimeout(fetchVMs, 1000); // Refresh after action
    } catch (e) {
      console.error('VM action failed:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (status: string) =>
    status === 'running' ? 'bg-green-500' : status === 'paused' ? 'bg-yellow-500' : 'bg-red-500';
  const textColor = (status: string) =>
    status === 'running' ? 'text-green-600' : status === 'paused' ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">VMs on {nodeName}</CardTitle>
            <CardDescription>{vms.length} virtual machines</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={fetchVMs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && vms.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : vms.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No VMs on this node</p>
        ) : (
          <div className="space-y-2">
            {vms.map((vm) => (
              <div key={vm.vmid} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="primary" className="font-mono text-xs">
                    {vm.vmid}
                  </Badge>
                  <span className="font-medium">{vm.name || `VM ${vm.vmid}`}</span>
                  <Badge variant="outline" className={`${textColor(vm.status)} border-current capitalize`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${statusColor(vm.status)}`} />
                    {vm.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-muted-foreground hidden sm:flex gap-4">
                    <span>CPU: {vm.cpu_usage?.toFixed(1) ?? 0}%</span>
                    <span>RAM: {formatBytes(vm.mem_usage ?? 0)}</span>
                  </div>
                  <div className="flex gap-1">
                    {vm.status === 'stopped' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(vm.vmid, 'start')}
                        disabled={actionLoading === vm.vmid}
                      >
                        {actionLoading === vm.vmid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-green-600" />}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(vm.vmid, 'reboot')}
                          disabled={actionLoading === vm.vmid}
                          title="Reboot"
                        >
                          <RefreshCw className="h-4 w-4 text-amber-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(vm.vmid, 'shutdown')}
                          disabled={actionLoading === vm.vmid}
                          title="Shutdown"
                        >
                          <Power className="h-4 w-4 text-orange-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Server Card with Expandable Nodes ───

interface ServerCardProps {
  server: ProxmoxServerAdmin;
  nodes: ProxmoxNode[];
  nodesLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onSyncNodes: () => void;
}

function ServerCard({
  server,
  nodes,
  nodesLoading,
  isExpanded,
  onToggleExpand,
  onEdit,
  onToggleActive,
  onDelete,
  onSyncNodes,
}: ServerCardProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const serverNodes = nodes.filter((n) => n.server_name === server.name);
  const onlineNodes = serverNodes.filter((n) => n.status === 'online').length;
  const selectedNode = serverNodes.find((n) => n.id === selectedNodeId);

  return (
    <Card className={`shadow-card hover:shadow-card-hover transition-all ${!server.is_active ? 'opacity-60' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="font-heading text-lg">{server.name}</CardTitle>
                  <CardDescription>{server.description || server.host}</CardDescription>
                </div>
              </div>
            </CollapsibleTrigger>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={server.is_active ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground'}>{server.is_active ? 'Active' : 'Inactive'}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Check className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSyncNodes}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Sync Nodes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onToggleActive}>
                    {server.is_active ? (
                      <>
                        <X className="h-4 w-4 mr-2" /> Deactivate
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" /> Activate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              {onlineNodes}/{serverNodes.length} nodes online
            </span>
            <span>|</span>
            <span>{server.host}:{server.port}</span>
            {server.active_sessions_count !== undefined && (
              <>
                <span>|</span>
                <span>{server.active_sessions_count} active sessions</span>
              </>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {nodesLoading && serverNodes.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : serverNodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No nodes found. Click "Sync Nodes" to discover nodes from this server.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {serverNodes.map((node) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      onSelectNode={setSelectedNodeId}
                      selectedNodeId={selectedNodeId}
                    />
                  ))}
                </div>

                {selectedNode && (
                  <VMsPanel
                    nodeId={selectedNode.id}
                    nodeName={selectedNode.name}
                    onClose={() => setSelectedNodeId(null)}
                  />
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// ─── Main Page Component ───

export default function InfrastructurePage() {
  const [servers, setServers] = useState<ProxmoxServerAdmin[]>([]);
  const [nodes, setNodes] = useState<ProxmoxNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedServers, setExpandedServers] = useState<Set<number>>(new Set());

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ProxmoxServerAdmin | null>(null);
  const [formData, setFormData] = useState<ProxmoxServerFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteServer, setDeleteServer] = useState<ProxmoxServerAdmin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch servers and nodes
  const fetchServers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<{ data: ProxmoxServerAdmin[] }>('/admin/proxmox-servers');
      setServers(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch servers');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNodes = useCallback(async () => {
    setNodesLoading(true);
    try {
      const data = await adminApi.getNodes();
      setNodes(data);
    } catch (err) {
      console.error('Failed to fetch nodes:', err);
    } finally {
      setNodesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
    fetchNodes();
  }, [fetchServers, fetchNodes]);

  // Auto-refresh nodes every 30s
  useEffect(() => {
    const interval = setInterval(fetchNodes, 30000);
    return () => clearInterval(interval);
  }, [fetchNodes]);

  const handleToggleExpand = (serverId: number) => {
    setExpandedServers((prev) => {
      const next = new Set(prev);
      if (next.has(serverId)) {
        next.delete(serverId);
      } else {
        next.add(serverId);
      }
      return next;
    });
  };

  const handleSaveServer = async () => {
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingServer) {
        const payload: Record<string, unknown> = { ...formData };
        if (!formData.token_id) delete payload.token_id;
        if (!formData.token_secret) delete payload.token_secret;
        await client.patch(`/admin/proxmox-servers/${editingServer.id}`, payload);
      } else {
        await client.post('/admin/proxmox-servers', formData);
      }

      setIsDialogOpen(false);
      setEditingServer(null);
      setFormData(initialFormData);
      fetchServers();
      fetchNodes();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; errors?: Record<string, string[]>; message?: string } } };
      if (axiosErr.response?.data?.error) {
        setFormError(axiosErr.response.data.error);
      } else if (axiosErr.response?.data?.errors) {
        const errorMessages = Object.entries(axiosErr.response.data.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`)
          .join('\n');
        setFormError(errorMessages);
      } else if (axiosErr.response?.data?.message) {
        setFormError(axiosErr.response.data.message);
      } else {
        setFormError(err instanceof Error ? err.message : 'Failed to save server');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (server: ProxmoxServerAdmin) => {
    try {
      await client.patch(`/admin/proxmox-servers/${server.id}`, { is_active: !server.is_active });
      fetchServers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update server');
    }
  };

  const handleDeleteServer = async () => {
    if (!deleteServer) return;
    setDeleteLoading(true);
    try {
      await client.delete(`/admin/proxmox-servers/${deleteServer.id}`);
      setDeleteServer(null);
      fetchServers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete server');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSyncNodes = async (serverId: number) => {
    try {
      await client.post(`/admin/proxmox-servers/${serverId}/sync-nodes`);
      fetchNodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync nodes');
    }
  };

  const handleRefresh = () => {
    fetchServers();
    fetchNodes();
  };

  // Stats
  const activeServers = servers.filter((s) => s.is_active).length;
  const onlineNodes = nodes.filter((n) => n.status === 'online').length;
  const totalVMs = nodes.reduce((sum, n) => sum + (n.active_vm_count ?? 0), 0);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Infrastructure" />
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">Infrastructure</h1>
                <p className="text-muted-foreground">Manage Proxmox servers, nodes, and virtual machines</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || nodesLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading || nodesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                className="bg-info text-info-foreground hover:bg-info/90"
                onClick={() => {
                  setEditingServer(null);
                  setFormData(initialFormData);
                  setIsDialogOpen(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Server
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 text-info">
                    <Server className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Servers</p>
                    <p className="font-heading text-2xl font-bold text-foreground">
                      {activeServers}/{servers.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nodes Online</p>
                    <p className="font-heading text-2xl font-bold text-foreground">
                      {onlineNodes}/{nodes.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total VMs</p>
                    <p className="font-heading text-2xl font-bold text-foreground">{totalVMs}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Servers List */}
          {loading && servers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : servers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center py-12"
            >
              <Server className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-heading text-lg font-medium">No Proxmox servers configured</h3>
              <p className="text-muted-foreground mb-4">Add your first Proxmox VE cluster to get started.</p>
              <Button className="bg-info text-info-foreground hover:bg-info/90" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Server
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {servers.map((server, i) => (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <ServerCard
                    server={server}
                    nodes={nodes}
                    nodesLoading={nodesLoading}
                    isExpanded={expandedServers.has(server.id)}
                    onToggleExpand={() => handleToggleExpand(server.id)}
                    onEdit={() => {
                      setEditingServer(server);
                      setFormData({
                        name: server.name ?? '',
                        description: server.description ?? '',
                        host: server.host ?? '',
                        port: server.port ?? 8006,
                        realm: server.realm ?? 'pam',
                        token_id: '',
                        token_secret: '',
                        verify_ssl: server.verify_ssl ?? true,
                      });
                      setIsDialogOpen(true);
                    }}
                    onToggleActive={() => handleToggleActive(server)}
                    onDelete={() => setDeleteServer(server)}
                    onSyncNodes={() => handleSyncNodes(server.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Server Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingServer ? 'Edit Proxmox Server' : 'Add Proxmox Server'}</DialogTitle>
            <DialogDescription>
              {editingServer ? 'Update server configuration.' : 'Register a new Proxmox VE cluster.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Production Cluster"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={formLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Main datacenter cluster"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={formLoading}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="192.168.1.100"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  disabled={formLoading}
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                  disabled={formLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token_id">API Token ID</Label>
              <Input
                id="token_id"
                placeholder="user@pam!token-name"
                value={formData.token_id}
                onChange={(e) => setFormData({ ...formData, token_id: e.target.value })}
                disabled={formLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token_secret">API Token Secret</Label>
              <Input
                id="token_secret"
                type="password"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={formData.token_secret}
                onChange={(e) => setFormData({ ...formData, token_secret: e.target.value })}
                disabled={formLoading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verify_ssl"
                checked={formData.verify_ssl}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, verify_ssl: checked })}
                disabled={formLoading}
              />
              <Label htmlFor="verify_ssl">Verify SSL Certificate</Label>
            </div>
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingServer(null);
                setFormData(initialFormData);
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveServer} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formLoading ? 'Testing Connection...' : editingServer ? 'Save Changes' : 'Add Server'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteServer} onOpenChange={() => setDeleteServer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Server</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteServer?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteServer(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteServer} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
