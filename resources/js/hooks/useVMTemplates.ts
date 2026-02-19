/**
 * Hook for fetching VM templates.
 * Sprint 2 - Phase 2
 */

import { useCallback, useEffect, useState } from 'react';
import { vmTemplateApi } from '../api/vm.api';
import type { VMTemplate } from '../types/vm.types';

interface UseVMTemplatesResult {
  templates: VMTemplate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVMTemplates(): UseVMTemplatesResult {
  const [templates, setTemplates] = useState<VMTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vmTemplateApi.list();
      setTemplates(data.filter((t) => t.is_active));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load templates';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, error, refetch: fetchTemplates };
}
