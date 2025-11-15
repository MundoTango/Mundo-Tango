import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodePreviewProps {
  code: string;
  language: string;
  explanation?: string;
  files?: string[];
}

export function CodePreview({ code, language, explanation, files }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = files?.[0] || 'generated-code.tsx';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Generated Code</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              data-testid="button-copy-code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              data-testid="button-download-code"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {explanation && (
          <div className="mb-4 p-3 bg-muted rounded">
            <p className="text-sm">{explanation}</p>
          </div>
        )}
        
        {files && files.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Suggested file locations:</p>
            {files.map((file) => (
              <div key={file} className="text-sm font-mono bg-muted p-2 rounded mb-1">
                {file}
              </div>
            ))}
          </div>
        )}
        
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </CardContent>
    </Card>
  );
}
