import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ElementInspector({ element }: ElementInspectorProps) {
  if (!element) {
    return (
      <Card data-testid="element-inspector-empty">
        <CardHeader>
          <CardTitle>Element Inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click an element to inspect it
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const computedStyle = window.getComputedStyle(element);
  
  const styleProperties = [
    { name: 'Display', value: computedStyle.display },
    { name: 'Position', value: computedStyle.position },
    { name: 'Width', value: computedStyle.width },
    { name: 'Height', value: computedStyle.height },
    { name: 'Padding', value: computedStyle.padding },
    { name: 'Margin', value: computedStyle.margin },
    { name: 'Background', value: computedStyle.backgroundColor },
    { name: 'Color', value: computedStyle.color },
    { name: 'Font Size', value: computedStyle.fontSize },
    { name: 'Font Weight', value: computedStyle.fontWeight },
    { name: 'Text Align', value: computedStyle.textAlign },
    { name: 'Border', value: computedStyle.border },
    { name: 'Border Radius', value: computedStyle.borderRadius },
    { name: 'Flex Direction', value: computedStyle.flexDirection },
    { name: 'Gap', value: computedStyle.gap },
  ];
  
  const classList = element.className ? element.className.split(' ').filter(Boolean) : [];
  
  return (
    <Card data-testid="element-inspector">
      <CardHeader>
        <CardTitle>Element Inspector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Element Info</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tag:</span>
              <Badge variant="secondary" data-testid="element-tag">
                {element.tagName.toLowerCase()}
              </Badge>
            </div>
            {element.id && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">ID:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded" data-testid="element-id">
                  #{element.id}
                </code>
              </div>
            )}
            {element.getAttribute('data-testid') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Test ID:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded" data-testid="element-testid">
                  {element.getAttribute('data-testid')}
                </code>
              </div>
            )}
            {classList.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Classes:</span>
                <div className="flex flex-wrap gap-1" data-testid="element-classes">
                  {classList.map((cls, index) => (
                    <Badge key={`${cls}-${index}`} variant="outline">
                      .{cls}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-2">Computed Styles</h4>
          <ScrollArea className="h-64">
            <div className="space-y-2" data-testid="element-styles">
              {styleProperties.map((prop) => (
                <div key={prop.name} className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {prop.name}:
                  </span>
                  <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                    {prop.value}
                  </code>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

interface ElementInspectorProps {
  element: HTMLElement | null;
}
