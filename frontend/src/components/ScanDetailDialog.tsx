import { useState, useMemo } from 'react';
import { useAnalyzeScan, useGetExternalApiConfig } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Brain, Image as ImageIcon, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import type { CTScan, TumorStage } from '../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScanDetailDialogProps {
  scan: CTScan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stageLabels: Record<TumorStage, string> = {
  stage0: 'Stage 0 (In Situ)',
  stage1: 'Stage I (Localized)',
  stage2: 'Stage II (Regional)',
  stage3: 'Stage III (Advanced)',
  stage4: 'Stage IV (Metastatic)',
};

const stageColors: Record<TumorStage, string> = {
  stage0: 'bg-medical-success text-white',
  stage1: 'bg-blue-500 text-white',
  stage2: 'bg-medical-warning text-white',
  stage3: 'bg-orange-500 text-white',
  stage4: 'bg-destructive text-white',
};

export default function ScanDetailDialog({ scan, open, onOpenChange }: ScanDetailDialogProps) {
  const analyzeScan = useAnalyzeScan();
  const { data: apiConfig } = useGetExternalApiConfig();
  const [activeTab, setActiveTab] = useState('original');

  const originalImageUrl = useMemo(() => {
    const blob = new Blob([new Uint8Array(scan.scanImage)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }, [scan.scanImage]);

  const maskImageUrl = useMemo(() => {
    if (!scan.analysisResult) return null;
    const blob = new Blob([new Uint8Array(scan.analysisResult.maskImage)], { type: 'image/png' });
    return URL.createObjectURL(blob);
  }, [scan.analysisResult]);

  const isApiConfigured = apiConfig?.endpointUrl && apiConfig?.apiKey;

  const handleAnalyze = () => {
    if (!isApiConfigured) {
      return;
    }
    analyzeScan.mutate(scan.id);
  };

  const hasAnalysis = !!scan.analysisResult;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            CT Scan #{scan.id.toString()}
            {hasAnalysis && (
              <Badge variant="default" className="bg-medical-success text-white">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Analyzed
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Patient ID: {scan.patientId}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Analysis Action */}
          {!hasAnalysis && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              {!isApiConfigured ? (
                <Alert variant="destructive">
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    API configuration is incomplete. Please configure both the API endpoint and API key in the settings
                    before running analysis.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Ready for Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Run AI analysis to detect pancreatic tumors
                    </p>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzeScan.isPending || !isApiConfigured}
                    className="bg-gradient-to-r from-medical-primary to-medical-secondary"
                  >
                    {analyzeScan.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Analyze Scan
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Image Viewer */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Original Scan
              </TabsTrigger>
              <TabsTrigger value="analysis" disabled={!hasAnalysis} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Analysis Result
              </TabsTrigger>
            </TabsList>

            <TabsContent value="original" className="mt-4">
              <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
                <img src={originalImageUrl} alt="Original CT Scan" className="h-auto w-full object-contain" />
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              {hasAnalysis && maskImageUrl ? (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
                    <img src={maskImageUrl} alt="Tumor Mask" className="h-auto w-full object-contain" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Highlighted regions indicate detected tumor areas
                  </p>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground">No analysis results available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Analysis Results */}
          {hasAnalysis && scan.analysisResult && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Analysis Results</h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {scan.analysisResult.tumorFound ? (
                        <AlertCircle className="h-5 w-5 text-medical-warning" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-medical-success" />
                      )}
                      <span>Detection Status</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {scan.analysisResult.tumorFound ? 'Tumor Detected' : 'No Tumor Detected'}
                    </p>
                  </div>

                  {scan.analysisResult.tumorFound && (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="text-sm text-muted-foreground">Tumor Stage</div>
                      <Badge className={`mt-2 ${stageColors[scan.analysisResult.stage]}`}>
                        {stageLabels[scan.analysisResult.stage]}
                      </Badge>
                    </div>
                  )}

                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Detection Probability</div>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {(scan.analysisResult.probability * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Confidence Score</div>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {(scan.analysisResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
