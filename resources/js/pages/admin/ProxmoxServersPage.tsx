/**
 * Admin Proxmox Servers Page - Manage Proxmox clusters.
 * Sprint 2.5 - Multi-server support
 */

import { Head } from '@inertiajs/react';
import { Check, Loader2, MoreVertical, PlusCircle, RefreshCw, Server, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import client from '@/api/client';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ProxmoxServerAdmin } from '@/types/vm.types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Admin', href: '/admin/proxmox-servers' },
  { title: 'Proxmox Servers', href: '/admin/proxmox-servers' },
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

export default function ProxmoxServersPage() {
  const [servers, setServers] = useState<ProxmoxServerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProxmoxServerFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteServer, setDeleteServer] = useState<ProxmoxServerAdmin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchServers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<{ data: ProxmoxServerAdmin[] }>('/admin/proxmox-servers');
      setServers(response.data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch servers';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleCreateServer = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      await client.post('/admin/proxmox-servers', formData);
      setIsDialogOpen(false);
      setFormData(initialFormData);
      fetchServers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      if (axiosErr.response?.data?.error) {
        setFormError(axiosErr.response.data.error);
      } else {
        setFormError(err instanceof Error ? err.message : 'Failed to create server');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (server: ProxmoxServerAdmin) => {
    try {
      await client.patch(`/admin/proxmox-servers/${server.id}`, {
        is_active: !server.is_active,
      });
      fetchServers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update server';
      setError(message);
    }
  };

  const handleDeleteServer = async () => {
    if (!deleteServer) return;
    setDeleteLoading(true);
    try {
      await client.delete(`/admin/proxmox-servers/${deleteServer.id}`);
      setDeleteServer(null);
      fetchServers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { nodes_count?: number } } };
      if (axiosErr.response?.data?.nodes_count) {
        setError(`Cannot delete: server has ${axiosErr.response.data.nodes_count} associated nodes`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete server');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const activeCount = servers.filter((s) => s.is_active).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Proxmox Servers" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Heading title="Proxmox Servers" description="Manage Proxmox VE clusters" />
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">
                {activeCount} of {servers.length} servers active
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchServers()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Server
            </Button>
          </div>
        </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && servers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-12">
          <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Proxmox servers configured</h3>
          <p className="text-muted-foreground mb-4">
            Add your first Proxmox VE cluster to get started.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <Card key={server.id} className={!server.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleActive(server)}>
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
                      <DropdownMenuItem
                        onClick={() => setDeleteServer(server)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{server.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Host</span>
                    <span className="font-mono">{server.host}:{server.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Realm</span>
                    <span>{server.realm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SSL</span>
                    <span>{server.verify_ssl ? 'Verified' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={server.is_active ? 'default' : 'secondary'}>
                      {server.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {server.nodes_count !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nodes</span>
                      <span>{server.nodes_count}</span>
                    </div>
                  )}
                  {server.active_sessions_count !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Sessions</span>
                      <span>{server.active_sessions_count}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Server Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Proxmox Server</DialogTitle>
            <DialogDescription>
              Register a new Proxmox VE cluster. Connection will be tested before saving.
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateServer} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formLoading ? 'Testing Connection...' : 'Add Server'}
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
      </div>
    </AppLayout>
  );
}
