import { useState, useEffect } from 'react';
import { useGetApiConfig, useSaveApiConfig } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Server, Key } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApiConfigDialog({ open, onOpenChange }: ApiConfigDialogProps) {
  const { data: apiConfig, isLoading } = useGetApiConfig();
  const saveApiConfig = useSaveApiConfig();
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (apiConfig) {
      setEndpoint(apiConfig.endpoint);
      setApiKey(apiConfig.apiKey);
    }
  }, [apiConfig]);

  const handleSave = () => {
    if (!endpoint.trim() || !apiKey.trim()) return;
    saveApiConfig.mutate(
      { endpoint: endpoint.trim(), apiKey: apiKey.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isFormValid = endpoint.trim() && apiKey.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-medical-primary" />
            Configure AI API
          </DialogTitle>
          <DialogDescription>
            Set the external AI service URL and authentication key for pancreatic tumor detection analysis.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription className="text-xs">
                This endpoint will receive CT scan images and return tumor detection results. The API key will be
                included in the Authorization header.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="endpoint" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                API Endpoint URL
              </Label>
              <Input
                id="endpoint"
                placeholder="https://api.example.com/analyze"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {apiConfig?.endpoint ? 'Current endpoint configured' : 'No endpoint configured yet'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {apiConfig?.apiKey ? 'API key is configured (hidden for security)' : 'No API key configured yet'}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || saveApiConfig.isPending}
            className="bg-gradient-to-r from-medical-primary to-medical-secondary"
          >
            {saveApiConfig.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
