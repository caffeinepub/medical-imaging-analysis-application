import { useState } from 'react';
import { useGetAllScans } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText } from 'lucide-react';
import ScanCard from './ScanCard';
import ScanDetailDialog from './ScanDetailDialog';
import type { CTScan } from '../backend';

interface ScansListTabProps {
  onUploadClick: () => void;
}

export default function ScansListTab({ onUploadClick }: ScansListTabProps) {
  const { data: scans, isLoading } = useGetAllScans();
  const [selectedScan, setSelectedScan] = useState<CTScan | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Scans Yet</CardTitle>
          <CardDescription>Upload your first CT scan to get started with AI-powered analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              No CT scans have been uploaded yet. Start by uploading a scan for analysis.
            </p>
            <Button onClick={onUploadClick} className="bg-gradient-to-r from-medical-primary to-medical-secondary">
              <Upload className="mr-2 h-4 w-4" />
              Upload First Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scans.map((scan) => (
          <ScanCard key={scan.id.toString()} scan={scan} onClick={() => setSelectedScan(scan)} />
        ))}
      </div>

      {selectedScan && (
        <ScanDetailDialog scan={selectedScan} open={!!selectedScan} onOpenChange={() => setSelectedScan(null)} />
      )}
    </>
  );
}
