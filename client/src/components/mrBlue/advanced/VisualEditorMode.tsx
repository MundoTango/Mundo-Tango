import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';

const VisualEditorSplitPane = lazy(() => 
  import('@/components/visual-editor/VisualEditorSplitPane').then(m => ({
    default: m.VisualEditorSplitPane
  }))
);

/**
 * Visual Editor Mode - Embedded wrapper
 * 
 * Embeds the Visual Editor split-pane interface within the unified Mr Blue interface
 * instead of using a separate route with ?edit=true
 */

export function VisualEditorMode() {
  return (
    <div className="h-full w-full" data-testid="mode-visual-editor">
      <Suspense fallback={<LoadingFallback message="Loading Visual Editor..." />}>
        <VisualEditorSplitPane isOpen={true} onClose={() => {}} embeddedMode={true} />
      </Suspense>
    </div>
  );
}
