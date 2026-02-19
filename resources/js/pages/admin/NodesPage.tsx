/**
 * Admin Nodes Page - Proxmox node health dashboard.
 * Sprint 2 - Phase 2
 */

import { RefreshCw, Server } from 'lucide-react';
import { AppContent } from '../../components/app-content';
import Heading from '../../components/heading';
import { NodeHealthCard } from '../../components/NodeHealthCard';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useNodeHealth } from '../../hooks/useNodeHealth';

export default function NodesPage() {
  const { nodes, loading, error, refetch } = useNodeHealth();

  const onlineCount = nodes.filter((n) => n.status === 'online').length;
  const totalCount = nodes.length;

  return (
    <AppContent>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading title="Proxmox Nodes" description="Monitor node health and resource usage" />
          {!loading && (
            <p className="text-sm text-muted-foreground mt-1">
              {onlineCount} of {totalCount} nodes online
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && nodes.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {nodes.map((node) => (
            <NodeHealthCard key={node.id} node={node} />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Stats auto-refresh every 30 seconds
      </p>
    </AppContent>
  );
}
