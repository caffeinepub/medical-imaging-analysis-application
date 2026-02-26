import { useState, useEffect } from 'react';
import { useGetExternalApiConfig, useConfigureExternalApi } from '../hooks/useQueries';
import { Loader2, Eye, EyeOff, Settings2 } from 'lucide-react';

interface ApiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApiConfigDialog({ open, onOpenChange }: ApiConfigDialogProps) {
  const { data: apiConfig, isLoading } = useGetExternalApiConfig();
  const configureApi = useConfigureExternalApi();

  const [endpointUrl, setEndpointUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [endpointError, setEndpointError] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');

  // Pre-fill fields when dialog opens or config loads
  useEffect(() => {
    if (open) {
      setEndpointUrl(apiConfig?.endpointUrl ?? '');
      setApiKey(apiConfig?.apiKey ?? '');
      setShowApiKey(false);
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
    if (configureApi.isPending) return;
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    /* Modal overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent black backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Dialog box — white, rounded, centered, ~500px wide */}
      <div
        className="relative z-10 w-full max-w-[500px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-config-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <Settings2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 id="api-config-title" className="text-lg font-bold text-gray-900">
              API Configuration
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure the external AI service for CT scan analysis
            </p>
          </div>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Loading current configuration…</p>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-5">
            {/* API Endpoint URL */}
            <div className="space-y-1.5">
              <label
                htmlFor="api-endpoint-url"
                className="block text-sm font-medium text-gray-700"
              >
                API Endpoint URL
              </label>
              <input
                id="api-endpoint-url"
                type="text"
                placeholder="https://your-ai-service.com/api/analyze"
                value={endpointUrl}
                onChange={(e) => handleEndpointChange(e.target.value)}
                disabled={configureApi.isPending}
                autoComplete="off"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  endpointError
                    ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              />
              {endpointError && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <span>⚠</span> {endpointError}
                </p>
              )}
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  disabled={configureApi.isPending}
                  autoComplete="new-password"
                  className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    apiKeyError
                      ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  disabled={configureApi.isPending}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {apiKeyError && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <span>⚠</span> {apiKeyError}
                </p>
              )}
            </div>

            {/* Mutation error */}
            {configureApi.isError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">
                  {configureApi.error?.message ?? 'Failed to save configuration. Please try again.'}
                </p>
              </div>
            )}

            {/* Info note */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Note:</strong> The API endpoint must accept image uploads and return JSON
                with tumor coordinates and stage information. Ensure CORS is enabled for your
                Internet Computer domain.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex justify-end gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={configureApi.isPending}
            className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={configureApi.isPending || isLoading}
            className="px-5 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
          >
            {configureApi.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
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
