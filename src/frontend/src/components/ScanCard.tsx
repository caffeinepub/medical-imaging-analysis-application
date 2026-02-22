import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { CTScan } from '../backend';
import { useMemo } from 'react';

interface ScanCardProps {
  scan: CTScan;
  onClick: () => void;
}

export default function ScanCard({ scan, onClick }: ScanCardProps) {
  const imageUrl = useMemo(() => {
    const blob = new Blob([new Uint8Array(scan.scanImage)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }, [scan.scanImage]);

  const hasAnalysis = !!scan.analysisResult;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-medical-primary/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-medical-primary" />
            <CardTitle className="text-base">Scan #{scan.id.toString()}</CardTitle>
          </div>
          {hasAnalysis ? (
            <Badge variant="default" className="bg-medical-success text-white">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Analyzed
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Pending
            </Badge>
          )}
        </div>
        <CardDescription>Patient: {scan.patientId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border bg-muted/30">
          <img src={imageUrl} alt={`CT Scan ${scan.id}`} className="h-32 w-full object-cover" />
        </div>
        {hasAnalysis && scan.analysisResult && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            {scan.analysisResult.tumorFound ? (
              <>
                <AlertCircle className="h-4 w-4 text-medical-warning" />
                <span className="text-muted-foreground">Tumor detected</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-medical-success" />
                <span className="text-muted-foreground">No tumor detected</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
