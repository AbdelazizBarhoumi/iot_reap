/**
 * Admin Nodes Page - Proxmox node health dashboard.
 * Sprint 2 - Phase 2
 */

import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Network, RefreshCw, Server } from 'lucide-react';
import { useState } from 'react';
import { NodeHealthCard } from '@/components/NodeHealthCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VMListCard } from '@/components/VMListCard';
import { useNodeHealth } from '@/hooks/useNodeHealth';
import { useNodeVMs } from '@/hooks/useNodeVMs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Admin', href: '/admin/nodes' },
  { title: 'Proxmox Nodes', href: '/admin/nodes' },
];

export default function NodesPage() {
  const { nodes, loading, error, refetch } = useNodeHealth();
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const {
    vms,
    loading: vmsLoading,
    error: vmsError,
    refetch: refetchVMs,
    startVM,
    stopVM,
    rebootVM,
    shutdownVM,
    actionLoading,
  } = useNodeVMs(selectedNodeId);

  const onlineCount = nodes.filter((n) => n.status === 'online').length;
  const totalCount = nodes.length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Proxmox Nodes" />
      <div className="min-h-screen bg-background">
        <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            {selectedNodeId ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setSelectedNodeId(null)}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-heading text-3xl font-bold text-foreground">VMs on {selectedNode?.name || 'Node'}</h1>
                  <p className="text-muted-foreground">Manage virtual machines</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-heading text-3xl font-bold text-foreground">Proxmox Nodes</h1>
                  <p className="text-muted-foreground">Monitor node health and resource usage</p>
                  {!loading && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {onlineCount} of {totalCount} nodes online
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => selectedNodeId ? refetchVMs() : refetch()} disabled={loading || vmsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || vmsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {selectedNodeId ? (
          // Show VMs for selected node
          <div className="space-y-4">
            {selectedNode && (
              <NodeHealthCard
                node={selectedNode}
                isSelected
              />
            )}
            <VMListCard
              vms={vms}
              loading={vmsLoading}
              error={vmsError}
              actionLoading={actionLoading}
              onStart={startVM}
              onStop={stopVM}
              onReboot={rebootVM}
              onShutdown={shutdownVM}
              onRefresh={refetchVMs}
            />
          </div>
        ) : (
          // Show node grid
          <>
            {loading && nodes.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-[200px]" />
                ))}
              </div>
            ) : nodes.length === 0 ? (
              <div className="text-center py-12">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No nodes found</h3>
                <p className="text-muted-foreground">
                  No Proxmox nodes have been configured yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {nodes.map((node) => (
                  <NodeHealthCard
                    key={node.id}
                    node={node}
                    onViewVMs={setSelectedNodeId}
                    isSelected={selectedNodeId === node.id}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Stats auto-refresh every {selectedNodeId ? '15' : '30'} seconds
        </p>
        </div>
      </div>
    </AppLayout>
  );
}
