import { useState, useEffect } from 'react';
import * as teachingApi from '@/api/teaching.api';

export function useMyTrainingPaths() {
  const [trainingPaths, setTrainingPaths] = useState<teachingApi.TrainingPathEditing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingPaths = async () => {
      try {
        setLoading(true);
        const response = await teachingApi.getMyTrainingPaths();
        const payload = response.data;
        const trainingPathsData = Array.isArray(payload)
          ? payload
          : ('data' in payload && Array.isArray((payload as any).data) ? (payload as any).data : []);
        setTrainingPaths(trainingPathsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trainingPaths');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingPaths();
  }, []);

  const create = async (trainingPathData: Partial<teachingApi.TrainingPathEditing>) => {
    try {
      setLoading(true);
      const { data } = await teachingApi.createTrainingPath(trainingPathData);
      setTrainingPaths([...trainingPaths, data]);
      setError(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create trainingPath';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrainingPath = async (trainingPathId: string | number) => {
    try {
      await teachingApi.deleteTrainingPath(String(trainingPathId));
      setTrainingPaths(trainingPaths.filter(c => c.id !== trainingPathId));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete trainingPath';
      setError(message);
      throw err;
    }
  };

  const archiveTrainingPath = async (trainingPathId: string | number) => {
    try {
      await teachingApi.archiveTrainingPath(String(trainingPathId));
      setTrainingPaths(trainingPaths.map(c => 
        c.id === trainingPathId ? { ...c, status: 'archived' as const } : c
      ));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive trainingPath';
      setError(message);
      throw err;
    }
  };

  const restoreTrainingPath = async (trainingPathId: string | number) => {
    try {
      await teachingApi.restoreTrainingPath(String(trainingPathId));
      setTrainingPaths(trainingPaths.map(c => 
        c.id === trainingPathId ? { ...c, status: 'approved' as const } : c
      ));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore trainingPath';
      setError(message);
      throw err;
    }
  };

  const submitForReview = async (trainingPathId: string | number) => {
    try {
      await teachingApi.submitTrainingPathForReview(String(trainingPathId));
      setTrainingPaths(trainingPaths.map(c => 
        c.id === trainingPathId ? { ...c, status: 'pending_review' as const } : c
      ));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit trainingPath';
      setError(message);
      throw err;
    }
  };

  return { trainingPaths, loading, error, create, deleteTrainingPath, archiveTrainingPath, restoreTrainingPath, submitForReview };
}

export function useTrainingPathForEditing(trainingPathId: string) {
  const [trainingPath, setTrainingPath] = useState<teachingApi.TrainingPathEditing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainingPathId) return;

    const fetchTrainingPath = async () => {
      try {
        setLoading(true);
        const { data } = await teachingApi.getTrainingPathForEditing(trainingPathId);
        setTrainingPath(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trainingPath');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingPath();
  }, [trainingPathId]);

  const update = async (trainingPathData: Partial<teachingApi.TrainingPathEditing>) => {
    if (!trainingPathId) throw new Error('No trainingPath ID');
    try {
      setLoading(true);
      const { data } = await teachingApi.updateTrainingPath(trainingPathId, trainingPathData);
      setTrainingPath(data);
      setError(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update trainingPath';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!trainingPathId) throw new Error('No trainingPath ID');
    try {
      await teachingApi.submitTrainingPathForReview(trainingPathId);
      if (trainingPath) setTrainingPath({ ...trainingPath, status: 'submitted' });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit trainingPath';
      setError(message);
      throw err;
    }
  };

  const archive = async () => {
    if (!trainingPathId) throw new Error('No trainingPath ID');
    try {
      await teachingApi.archiveTrainingPath(trainingPathId);
      if (trainingPath) setTrainingPath({ ...trainingPath, status: 'archived' });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive trainingPath';
      setError(message);
      throw err;
    }
  };

  const restore = async () => {
    if (!trainingPathId) throw new Error('No trainingPath ID');
    try {
      await teachingApi.restoreTrainingPath(trainingPathId);
      if (trainingPath) setTrainingPath({ ...trainingPath, status: 'published' });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore trainingPath';
      setError(message);
      throw err;
    }
  };

  return { trainingPath, loading, error, update, submit, archive, restore };
}
