import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eraser, Download, Upload } from "lucide-react";

interface SignaturePadProps {
  onSave: (signatureData: string, method: 'draw' | 'type' | 'upload') => void;
  onClear?: () => void;
}

export function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear?.();
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl, 'draw');
  };

  const saveTypedSignature = () => {
    if (!typedName.trim()) return;
    onSave(typedName, 'type');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      onSave(dataUrl, 'upload');
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="draw" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="type">Type</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-2">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full bg-white cursor-crosshair rounded"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                data-testid="canvas-signature-pad"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCanvas}
                className="flex-1"
              >
                <Eraser className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={saveDrawnSignature}
                className="flex-1"
                data-testid="button-save-drawn-signature"
              >
                <Download className="w-4 h-4 mr-2" />
                Save Signature
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typed-name">Type your full name</Label>
              <Input
                id="typed-name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Enter your name"
                className="font-serif text-3xl text-center h-16"
              />
            </div>
            <Button
              onClick={saveTypedSignature}
              disabled={!typedName.trim()}
              className="w-full"
              data-testid="button-save-typed-signature"
            >
              Save Signature
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Uploaded signature"
                  className="max-h-32 mx-auto"
                />
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Upload signature image</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
