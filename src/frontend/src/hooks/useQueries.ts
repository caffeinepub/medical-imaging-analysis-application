import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, CTScan, ScanId, PatientId, ApiEndpoint, ApiKey } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// CT Scan Queries
export function useGetAllScans() {
  const { actor, isFetching } = useActor();

  return useQuery<CTScan[]>({
    queryKey: ['scans'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllScans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetScan(scanId: ScanId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<CTScan | null>({
    queryKey: ['scan', scanId?.toString()],
    queryFn: async () => {
      if (!actor || scanId === null) return null;
      return actor.readScan(scanId);
    },
    enabled: !!actor && !isFetching && scanId !== null,
  });
}

export function useUploadScan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, scanBlob }: { patientId: PatientId; scanBlob: Uint8Array }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadScan(patientId, scanBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      toast.success('CT scan uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload scan: ${error.message}`);
    },
  });
}

export function useAnalyzeScan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scanId: ScanId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.analyzeScan(scanId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['scan'] });
      toast.success('Analysis completed successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message;
      if (errorMessage.includes('API endpoint not configured')) {
        toast.error('API endpoint not configured. Please configure the API settings first.');
      } else if (errorMessage.includes('API key not configured')) {
        toast.error('API key not configured. Please configure the API settings first.');
      } else {
        toast.error(`Analysis failed: ${errorMessage}`);
      }
    },
  });
}

// API Configuration Queries (Admin only)
export function useGetApiConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<{ endpoint: ApiEndpoint; apiKey: ApiKey }>({
    queryKey: ['apiConfig'],
    queryFn: async () => {
      if (!actor) return { endpoint: '', apiKey: '' };
      try {
        const [endpoint, apiKey] = await Promise.all([
          actor.getApiEndpoint(),
          actor.getApiKey(),
        ]);
        return { endpoint, apiKey };
      } catch {
        return { endpoint: '', apiKey: '' };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveApiConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ endpoint, apiKey }: { endpoint: ApiEndpoint; apiKey: ApiKey }) => {
      if (!actor) throw new Error('Actor not available');
      await Promise.all([
        actor.configureApiEndpoint(endpoint),
        actor.configureApiKey(apiKey),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiConfig'] });
      toast.success('API configuration saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save configuration: ${error.message}`);
    },
  });
}

// Deprecated: Use useGetApiConfig instead
export function useGetApiEndpoint() {
  const { actor, isFetching } = useActor();

  return useQuery<ApiEndpoint>({
    queryKey: ['apiEndpoint'],
    queryFn: async () => {
      if (!actor) return '';
      try {
        return await actor.getApiEndpoint();
      } catch {
        return '';
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Deprecated: Use useSaveApiConfig instead
export function useConfigureApiEndpoint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (endpoint: ApiEndpoint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.configureApiEndpoint(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiEndpoint'] });
      toast.success('API endpoint configured successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to configure endpoint: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}
