/**
 * Dashboard Page - VM Template Browser
 * Sprint 2 - Phase 2 (US-06/US-07)
 */

import { Head, router } from '@inertiajs/react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useVMTemplates } from '@/hooks/useVMTemplates';
import { useVMSessions } from '@/hooks/useVMSessions';
import { VMTemplateCard } from '@/components/VMTemplateCard';
import { LaunchVMModal } from '@/components/LaunchVMModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { VMTemplate, VMSessionType } from '@/types/vm.types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
];

export default function Dashboard() {
  const { templates, loading: templatesLoading, error: templatesError } = useVMTemplates();
  const { createSession } = useVMSessions();

  const [selectedTemplate, setSelectedTemplate] = useState<VMTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTemplateSelect = useCallback((template: VMTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  }, []);

  const handleLaunchVM = useCallback(
    async (templateId: number, durationMinutes: number, sessionType: VMSessionType, proxmoxServerId?: number) => {
      try {
        const session = await createSession({
          template_id: templateId,
          duration_minutes: durationMinutes,
          session_type: sessionType,
          proxmox_server_id: proxmoxServerId,
        });

        // Redirect to session detail page
        router.visit(`/sessions/${session.id}`);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to launch VM';
        throw new Error(message);
      }
    },
    [createSession]
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VM Templates</h1>
          <p className="text-muted-foreground mt-2">
            Select a template to launch a new VM session
          </p>
        </div>

        {templatesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{templatesError}</AlertDescription>
          </Alert>
        )}

        {templatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No VM templates available. Please contact your administrator.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <VMTemplateCard
                key={template.id}
                template={template}
                onLaunch={handleTemplateSelect}
              />
            ))}
          </div>
        )}
      </div>

      <LaunchVMModal
        template={selectedTemplate}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onLaunch={handleLaunchVM}
      />
    </AppLayout>
  );
}
