import { useState } from 'react';
import { useUploadScan } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, FileImage } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadScanTabProps {
  onSuccess: () => void;
}

export default function UploadScanTab({ onSuccess }: UploadScanTabProps) {
  const [patientId, setPatientId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadScan = useUploadScan();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !patientId.trim()) return;

    const arrayBuffer = await selectedFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    uploadScan.mutate(
      { patientId: patientId.trim(), scanBlob: uint8Array },
      {
        onSuccess: () => {
          setPatientId('');
          setSelectedFile(null);
          setPreview(null);
          onSuccess();
        },
      }
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload CT Scan</CardTitle>
          <CardDescription>Upload a CT scan image for pancreatic tumor analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              placeholder="e.g., PT-2025-001"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">CT Scan Image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, DICOM (as image)
            </p>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              Ensure the CT scan image is properly oriented and shows the pancreatic region clearly for optimal
              analysis results.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !patientId.trim() || uploadScan.isPending}
            className="w-full bg-gradient-to-r from-medical-primary to-medical-secondary"
          >
            {uploadScan.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Preview of the selected CT scan image</CardDescription>
        </CardHeader>
        <CardContent>
          {preview ? (
            <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
              <img src={preview} alt="CT Scan Preview" className="h-auto w-full object-contain" />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
              <div className="text-center">
                <FileImage className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No image selected</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
