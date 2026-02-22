import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText } from 'lucide-react';
import UploadScanTab from '../components/UploadScanTab';
import ScansListTab from '../components/ScansListTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('scans');

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="mt-2 text-muted-foreground">
            Upload CT scans and view analysis results for pancreatic tumor detection
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="scans" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Scans
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scans" className="space-y-4">
            <ScansListTab onUploadClick={() => setActiveTab('upload')} />
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <UploadScanTab onSuccess={() => setActiveTab('scans')} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
