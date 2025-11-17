import { useState } from "react";
import { useNavigate } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileJson, AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ImportProgress {
  totalThreads: number;
  processedThreads: number;
  totalMessages: number;
  processedMessages: number;
  friendsFound: number;
  errors: string[];
}

interface ImportResult {
  success: boolean;
  message: string;
  progress: ImportProgress;
  metrics: {
    totalFriends: number;
    tier1Count: number;
    tier2Count: number;
    tier3Count: number;
  };
}

export default function FacebookDataImport() {
  const [, navigate] = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await apiRequest<ImportResult>('/api/social/import/facebook', {
        method: 'POST',
        body: formData,
      });
      return result;
    },
    onSuccess: (data) => {
      setImportResult(data);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to import Facebook data');
      setImportResult(null);
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json')) {
        setError('Please select a JSON file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clearExisting', clearExisting.toString());

    importMutation.mutate(formData);
  };

  const handleViewDashboard = () => {
    navigate('/closeness-metrics');
  };

  const progressPercentage = importResult
    ? Math.round((importResult.progress.processedThreads / importResult.progress.totalThreads) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Facebook Data Import</h1>
          <p className="text-lg text-muted-foreground">
            Import your Facebook Download Your Information (DYI) data to analyze your social connections
          </p>
        </div>

        <Alert data-testid="alert-instructions">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How to get your Facebook DYI data:</strong>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>Go to Facebook Settings → Privacy → Download Your Information</li>
              <li>Select "Messages", "Likes and Reactions", and "Comments"</li>
              <li>Choose JSON format and download</li>
              <li>Upload the downloaded JSON file here</li>
            </ol>
          </AlertDescription>
        </Alert>

        <Card data-testid="card-upload">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Facebook Data
            </CardTitle>
            <CardDescription>
              Upload your Facebook DYI JSON file to analyze your friendships and calculate closeness scores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover-elevate transition-all">
              <input
                type="file"
                id="file-upload"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                disabled={importMutation.isPending}
                data-testid="input-file"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileJson className="h-12 w-12 text-muted-foreground" />
                {file ? (
                  <>
                    <p className="text-lg font-medium" data-testid="text-filename">
                      {file.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">
                      Facebook DYI JSON file (max 100MB)
                    </p>
                  </>
                )}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="clear-existing"
                checked={clearExisting}
                onCheckedChange={(checked) => setClearExisting(checked as boolean)}
                disabled={importMutation.isPending}
                data-testid="checkbox-clear-existing"
              />
              <Label
                htmlFor="clear-existing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Clear existing data before import
              </Label>
            </div>

            <Button
              onClick={handleImport}
              disabled={!file || importMutation.isPending}
              className="w-full"
              size="lg"
              data-testid="button-import"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Facebook Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" data-testid="alert-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {importMutation.isPending && (
          <Card data-testid="card-progress">
            <CardHeader>
              <CardTitle>Importing Data...</CardTitle>
              <CardDescription>
                Please wait while we process your Facebook data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={33} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Processing your messages, likes, and comments...
              </p>
            </CardContent>
          </Card>
        )}

        {importResult && (
          <Card data-testid="card-results">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Import Successful!
              </CardTitle>
              <CardDescription>
                Your Facebook data has been imported and analyzed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Import Progress</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Friends Found</p>
                  <p className="text-2xl font-bold" data-testid="text-friends-found">
                    {importResult.progress.friendsFound}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Messages Processed</p>
                  <p className="text-2xl font-bold" data-testid="text-messages-processed">
                    {importResult.progress.processedMessages.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Closeness Tiers</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-green-600" data-testid="text-tier1-count">
                      {importResult.metrics.tier1Count}
                    </p>
                    <p className="text-sm text-muted-foreground">Tier 1</p>
                    <p className="text-xs text-muted-foreground">Closest Friends</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600" data-testid="text-tier2-count">
                      {importResult.metrics.tier2Count}
                    </p>
                    <p className="text-sm text-muted-foreground">Tier 2</p>
                    <p className="text-xs text-muted-foreground">Close Friends</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-600" data-testid="text-tier3-count">
                      {importResult.metrics.tier3Count}
                    </p>
                    <p className="text-sm text-muted-foreground">Tier 3</p>
                    <p className="text-xs text-muted-foreground">Acquaintances</p>
                  </div>
                </div>
              </div>

              {importResult.progress.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Errors during import:</strong>
                    <ul className="list-disc ml-5 mt-2">
                      {importResult.progress.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleViewDashboard}
                variant="default"
                size="lg"
                className="w-full"
                data-testid="button-view-dashboard"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                View Closeness Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
