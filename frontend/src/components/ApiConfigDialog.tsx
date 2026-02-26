import { useState, useEffect } from 'react';
import { useGetExternalApiConfig, useConfigureExternalApi } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

interface ApiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApiConfigDialog({ open, onOpenChange }: ApiConfigDialogProps) {
  const { data: apiConfig, isLoading } = useGetExternalApiConfig();
  const configureApi = useConfigureExternalApi();

  const [endpointUrl, setEndpointUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [endpointError, setEndpointError] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');

  // Pre-fill fields when dialog opens or config loads
  useEffect(() => {
    if (open && apiConfig) {
      setEndpointUrl(apiConfig.endpointUrl);
      setApiKey(apiConfig.apiKey);
    }
    if (!open) {
      setEndpointError('');
      setApiKeyError('');
    }
  }, [open, apiConfig]);

  const handleEndpointChange = (value: string) => {
    setEndpointUrl(value);
    if (endpointError) setEndpointError('');
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (apiKeyError) setApiKeyError('');
  };

  const validate = (): boolean => {
    let valid = true;
    if (!endpointUrl.trim()) {
      setEndpointError('API Endpoint URL is required.');
      valid = false;
    } else {
      try {
        new URL(endpointUrl.trim());
      } catch {
        setEndpointError('Please enter a valid URL (e.g. https://your-api.com/analyze).');
        valid = false;
      }
    }
    if (!apiKey.trim()) {
      setApiKeyError('API Key is required.');
      valid = false;
    }
    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;
    configureApi.mutate(
      { endpointUrl: endpointUrl.trim(), apiKey: apiKey.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    /* Modal overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent black backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={!configureApi.isPending ? handleCancel : undefined}
      />

      {/* Dialog box */}
      <div className="relative z-10 w-full max-w-[500px] mx-4 rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">API Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure the external AI service endpoint and authentication key for CT scan analysis.
          </p>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {/* API Endpoint URL */}
            <div className="space-y-1.5">
              <label htmlFor="api-endpoint-url" className="block text-sm font-medium text-gray-700">
                API Endpoint URL
              </label>
              <input
                id="api-endpoint-url"
                type="text"
                placeholder="https://your-ai-service.com/api/analyze"
                value={endpointUrl}
                onChange={(e) => handleEndpointChange(e.target.value)}
                disabled={configureApi.isPending}
                className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  endpointError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {endpointError && (
                <p className="text-xs text-red-600 mt-1">{endpointError}</p>
              )}
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                disabled={configureApi.isPending}
                className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  apiKeyError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {apiKeyError && (
                <p className="text-xs text-red-600 mt-1">{apiKeyError}</p>
              )}
            </div>

            {/* Mutation error */}
            {configureApi.isError && (
              <p className="text-xs text-red-600">
                {configureApi.error?.message ?? 'Failed to save configuration. Please try again.'}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={configureApi.isPending}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={configureApi.isPending}
            className="px-4 py-2 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {configureApi.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
