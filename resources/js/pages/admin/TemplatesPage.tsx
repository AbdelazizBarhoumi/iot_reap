/**
 * Admin Templates Page - VM Template management.
 * Sprint 2 - Phase 2
 */

import { Head } from '@inertiajs/react';
import { FileBox, Plus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import client from '@/api/client';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { VMTemplate } from '@/types/vm.types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Admin', href: '/admin/templates' },
  { title: 'VM Templates', href: '/admin/templates' },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<VMTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<{ data: VMTemplate[] }>('/api/templates');
      setTemplates(response.data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="VM Templates" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Heading title="VM Templates" description="Manage available VM templates for engineers" />
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">
                {templates.length} template{templates.length !== 1 ? 's' : ''} configured
              </p>
            )}
          </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchTemplates()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && templates.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[180px]" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <FileBox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No templates found</h3>
            <p className="text-muted-foreground">
              No VM templates have been configured yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.os_type} • {template.protocol.toUpperCase()}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>CPU: {template.cpu_cores} cores</div>
                    <div>RAM: {template.ram_mb} MB</div>
                    <div>Disk: {template.disk_gb} GB</div>
                    <div>Tags: {template.tags.length > 0 ? template.tags.join(', ') : 'None'}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
