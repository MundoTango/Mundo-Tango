import { Card } from '@/components/ui/card';

export function VisualDiff({ before, after }: VisualDiffProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-2">Before</h4>
        {before ? (
          <img src={before} alt="Before" className="w-full rounded" />
        ) : (
          <div className="w-full aspect-video bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
            No preview available
          </div>
        )}
      </Card>
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-2">After</h4>
        {after ? (
          <img src={after} alt="After" className="w-full rounded" />
        ) : (
          <div className="w-full aspect-video bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
            No preview available
          </div>
        )}
      </Card>
    </div>
  );
}

interface VisualDiffProps {
  before: string;
  after: string;
}
