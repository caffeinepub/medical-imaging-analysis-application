import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, CTScan, ScanId, PatientId, ExternalApiConfig } from '../backend';
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
export function useGetExternalApiConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExternalApiConfig | null>({
    queryKey: ['externalApiConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getExternalApiConfig();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useConfigureExternalApi() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ExternalApiConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.configureExternalApi(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['externalApiConfig'] });
      toast.success('API configuration saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save configuration: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
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
