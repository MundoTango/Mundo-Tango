import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Trash2, CheckCircle, XCircle, Loader2, Database } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ImportProgress {
  profile: boolean;
  posts: boolean;
  friends: boolean;
  events: boolean;
  groups: boolean;
}

interface FacebookImport {
  id: number;
  userId: number;
  accountName: string;
  importDate: string;
  dataType: string;
  status: string;
  errorMessage?: string;
  jsonData: {
    progress?: ImportProgress;
    profile?: any;
    posts?: any[];
    friends?: any[];
    events?: any[];
    groups?: any[];
  };
}

const FACEBOOK_ACCOUNTS = ['sboddye', 'mundotango1'];

export default function AdminFacebookImport() {
  const { toast } = useToast();

  // Fetch all imports
  const { data: importsData, isLoading } = useQuery<{ imports: FacebookImport[] }>({
    queryKey: ['/api/facebook/imports'],
  });
  const imports = importsData?.imports || [];

  // Fetch status for each account
  const { data: sboddyeStatus } = useQuery({
    queryKey: ['/api/facebook/import/status', 'sboddye'],
  });

  const { data: mundoTangoStatus } = useQuery({
    queryKey: ['/api/facebook/import/status', 'mundotango1'],
  });

  // Start import mutation
  const startImportMutation = useMutation({
    mutationFn: async (accountName: string) => {
      return apiRequest('POST', '/api/facebook/import/start', { accountName });
    },
    onSuccess: (data, accountName) => {
      toast({
        title: 'Import Started',
        description: `Import started for @${accountName}. This may take several minutes.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/imports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/import/status', accountName] });
    },
    onError: (error: any, accountName) => {
      toast({
        title: 'Import Failed',
        description: error.message || `Failed to start import for @${accountName}`,
        variant: 'destructive',
      });
    },
  });

  // Delete import mutation
  const deleteImportMutation = useMutation({
    mutationFn: async (importId: number) => {
      return apiRequest('DELETE', `/api/facebook/import/${importId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: 'Import Deleted',
        description: 'Import data has been permanently deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/imports'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Map to MT mutation
  const mapToMTMutation = useMutation({
    mutationFn: async (importId: number) => {
      return apiRequest('POST', `/api/facebook/import/map-to-mt/${importId}`, undefined);
    },
    onSuccess: (data) => {
      toast({
        title: 'Data Mapped Successfully',
        description: `Mapped ${data.mapped.posts} posts and ${data.mapped.friends} friends to Mundo Tango database.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/imports'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Mapping Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getProgressPercentage = (progress?: ImportProgress) => {
    if (!progress) return 0;
    const total = 5;
    const completed = [
      progress.profile,
      progress.posts,
      progress.friends,
      progress.events,
      progress.groups,
    ].filter(Boolean).length;
    return (completed / total) * 100;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'default'} data-testid={`badge-status-${status}`}>
        {status}
      </Badge>
    );
  };

  const renderAccountCard = (accountName: string, statusData: any) => {
    const isImporting = startImportMutation.isPending && startImportMutation.variables === accountName;
    const progress = statusData?.progress;
    const status = statusData?.status || 'not_started';

    return (
      <Card key={accountName} data-testid={`card-account-${accountName}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>@{accountName}</span>
            {getStatusBadge(status)}
          </CardTitle>
          <CardDescription>
            {status === 'not_started' && 'No imports yet'}
            {status === 'pending' && 'Import queued'}
            {status === 'processing' && 'Importing data...'}
            {status === 'completed' && `Last import: ${statusData.importDate ? format(new Date(statusData.importDate), 'MMM d, yyyy HH:mm') : 'Unknown'}`}
            {status === 'failed' && `Error: ${statusData.errorMessage || 'Unknown error'}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(getProgressPercentage(progress))}%</span>
              </div>
              <Progress value={getProgressPercentage(progress)} data-testid={`progress-${accountName}`} />
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {progress.profile ? (
                    <CheckCircle className="h-3 w-3 text-primary" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span>Profile</span>
                </div>
                <div className="flex items-center gap-1">
                  {progress.posts ? (
                    <CheckCircle className="h-3 w-3 text-primary" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span>Posts</span>
                </div>
                <div className="flex items-center gap-1">
                  {progress.friends ? (
                    <CheckCircle className="h-3 w-3 text-primary" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span>Friends</span>
                </div>
                <div className="flex items-center gap-1">
                  {progress.events ? (
                    <CheckCircle className="h-3 w-3 text-primary" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span>Events</span>
                </div>
                <div className="flex items-center gap-1">
                  {progress.groups ? (
                    <CheckCircle className="h-3 w-3 text-primary" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span>Groups</span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => startImportMutation.mutate(accountName)}
            disabled={isImporting || status === 'processing'}
            className="w-full"
            data-testid={`button-start-import-${accountName}`}
          >
            {isImporting || status === 'processing' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Start Import
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-6 max-w-7xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Facebook Data Import</h1>
            <p className="text-muted-foreground">System 0 Data Pipeline</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-6 max-w-7xl" data-testid="page-admin-facebook-import">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Facebook Data Import</h1>
          <p className="text-muted-foreground">System 0 Data Pipeline - Import Facebook data for @sboddye and @mundotango1</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {renderAccountCard('sboddye', sboddyeStatus)}
          {renderAccountCard('mundotango1', mundoTangoStatus)}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
            <CardDescription>All Facebook data imports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Import Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No imports found. Start an import above.
                    </TableCell>
                  </TableRow>
                ) : (
                  imports.map((imp) => (
                    <TableRow key={imp.id} data-testid={`row-import-${imp.id}`}>
                      <TableCell className="font-medium">@{imp.accountName}</TableCell>
                      <TableCell>{format(new Date(imp.importDate), 'MMM d, yyyy HH:mm')}</TableCell>
                      <TableCell>{getStatusBadge(imp.status)}</TableCell>
                      <TableCell>{imp.dataType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={getProgressPercentage(imp.jsonData?.progress)}
                            className="w-24"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(getProgressPercentage(imp.jsonData?.progress))}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {imp.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => mapToMTMutation.mutate(imp.id)}
                              disabled={mapToMTMutation.isPending}
                              data-testid={`button-map-to-mt-${imp.id}`}
                            >
                              <Database className="h-4 w-4" />
                              Map to MT
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-delete-${imp.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Import?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete all imported data for @{imp.accountName} from{' '}
                                  {format(new Date(imp.importDate), 'MMM d, yyyy')}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteImportMutation.mutate(imp.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
