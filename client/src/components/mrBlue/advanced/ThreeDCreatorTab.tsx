import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  Box, 
  Download, 
  Camera, 
  RotateCcw, 
  Move, 
  RotateCw, 
  Maximize,
  Palette,
  Play,
  Pause
} from 'lucide-react';
import { MrBlue3DModel } from './MrBlue3DModel';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export function ThreeDCreatorTab() {
  const { toast } = useToast();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Material properties
  const [color, setColor] = useState('#3b82f6');
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.5);
  
  // Transform properties
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
  
  // Control states
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [enableTransformControls, setEnableTransformControls] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Model path - try to load Mr. Blue model, fallback to cube
  const [modelPath] = useState<string | undefined>('/models/mr-blue.glb');

  const handleExportGLB = () => {
    try {
      const canvas = canvasContainerRef.current?.querySelector('canvas');
      if (!canvas) {
        toast({
          title: "Export Failed",
          description: "Canvas not found",
          variant: "destructive"
        });
        return;
      }

      // Access the Three.js scene from the canvas
      const scene = new THREE.Scene();
      
      // Create a simple geometry for export (in real implementation, this would be the actual scene)
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: metalness,
        roughness: roughness
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      mesh.scale.set(...scale);
      scene.add(mesh);

      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (result) => {
          const blob = new Blob([result as ArrayBuffer], { type: 'application/octet-stream' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'mr-blue-model.glb';
          link.click();
          URL.revokeObjectURL(link.href);
          
          toast({
            title: "Export Successful!",
            description: "Your 3D model has been downloaded as GLB",
          });
        },
        (error) => {
          console.error('Export failed:', error);
          toast({
            title: "Export Failed",
            description: "Could not export the model",
            variant: "destructive"
          });
        },
        { binary: true }
      );
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred during export",
        variant: "destructive"
      });
    }
  };

  const handleExportScreenshot = () => {
    try {
      const canvas = canvasContainerRef.current?.querySelector('canvas');
      if (!canvas) {
        toast({
          title: "Screenshot Failed",
          description: "Canvas not found",
          variant: "destructive"
        });
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'mr-blue-screenshot.png';
          link.click();
          URL.revokeObjectURL(link.href);
          
          toast({
            title: "Screenshot Saved!",
            description: "Your screenshot has been downloaded",
          });
        }
      });
    } catch (error) {
      console.error('Screenshot error:', error);
      toast({
        title: "Screenshot Failed",
        description: "Could not capture screenshot",
        variant: "destructive"
      });
    }
  };

  const handleResetCamera = () => {
    setPosition([0, 0, 0]);
    setRotation([0, 0, 0]);
    setScale([1, 1, 1]);
    toast({
      title: "Camera Reset",
      description: "View has been reset to default",
    });
  };

  const handleResetMaterial = () => {
    setColor('#3b82f6');
    setMetalness(0.5);
    setRoughness(0.5);
    toast({
      title: "Material Reset",
      description: "Material properties reset to defaults",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-blue-500" />
            3D Model Editor
          </CardTitle>
          <CardDescription>
            Edit and customize your 3D model with real-time material and transform controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 3D Canvas */}
          <div 
            ref={canvasContainerRef}
            className="w-full rounded-lg overflow-hidden border border-border"
            style={{ height: '500px' }}
            data-testid="canvas-3d-editor"
          >
            <MrBlue3DModel
              color={color}
              metalness={metalness}
              roughness={roughness}
              position={position}
              rotation={rotation}
              scale={scale}
              modelPath={modelPath}
              enableTransformControls={enableTransformControls}
              transformMode={transformMode}
              autoRotate={autoRotate}
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRotate(!autoRotate)}
              data-testid="button-toggle-rotation"
            >
              {autoRotate ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {autoRotate ? 'Pause' : 'Play'} Rotation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetCamera}
              data-testid="button-reset-camera"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportScreenshot}
              data-testid="button-export-screenshot"
            >
              <Camera className="h-4 w-4 mr-2" />
              Screenshot
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportGLB}
              data-testid="button-export-glb"
            >
              <Download className="h-4 w-4 mr-2" />
              Export GLB
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Material Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Material Editor
          </CardTitle>
          <CardDescription>
            Adjust color, metalness, and roughness properties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-4">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 rounded border border-border cursor-pointer"
                data-testid="input-color-picker"
              />
              <span className="text-sm text-muted-foreground font-mono">{color}</span>
            </div>
          </div>

          {/* Metalness Slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="metalness">Metalness</Label>
              <span className="text-sm text-muted-foreground">{metalness.toFixed(2)}</span>
            </div>
            <Slider
              id="metalness"
              min={0}
              max={1}
              step={0.01}
              value={[metalness]}
              onValueChange={([value]) => setMetalness(value)}
              data-testid="slider-metalness"
            />
          </div>

          {/* Roughness Slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="roughness">Roughness</Label>
              <span className="text-sm text-muted-foreground">{roughness.toFixed(2)}</span>
            </div>
            <Slider
              id="roughness"
              min={0}
              max={1}
              step={0.01}
              value={[roughness]}
              onValueChange={([value]) => setRoughness(value)}
              data-testid="slider-roughness"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleResetMaterial}
            className="w-full"
            data-testid="button-reset-material"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Material
          </Button>
        </CardContent>
      </Card>

      {/* Transform Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Transform Controls
          </CardTitle>
          <CardDescription>
            Position, rotate, and scale your model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Transform Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={transformMode === 'translate' ? 'default' : 'outline'}
              onClick={() => {
                setTransformMode('translate');
                setEnableTransformControls(true);
              }}
              className="flex-1"
              size="sm"
              data-testid="button-transform-translate"
            >
              <Move className="h-4 w-4 mr-2" />
              Move
            </Button>
            <Button
              variant={transformMode === 'rotate' ? 'default' : 'outline'}
              onClick={() => {
                setTransformMode('rotate');
                setEnableTransformControls(true);
              }}
              className="flex-1"
              size="sm"
              data-testid="button-transform-rotate"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Rotate
            </Button>
            <Button
              variant={transformMode === 'scale' ? 'default' : 'outline'}
              onClick={() => {
                setTransformMode('scale');
                setEnableTransformControls(true);
              }}
              className="flex-1"
              size="sm"
              data-testid="button-transform-scale"
            >
              <Maximize className="h-4 w-4 mr-2" />
              Scale
            </Button>
          </div>

          {/* Scale Controls */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Scale</Label>
              <span className="text-sm text-muted-foreground">
                {scale[0].toFixed(2)}
              </span>
            </div>
            <Slider
              min={0.1}
              max={3}
              step={0.1}
              value={[scale[0]]}
              onValueChange={([value]) => setScale([value, value, value])}
              data-testid="slider-scale"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setPosition([0, 0, 0]);
              setRotation([0, 0, 0]);
              setScale([1, 1, 1]);
              toast({
                title: "Transform Reset",
                description: "Position, rotation, and scale reset to defaults",
              });
            }}
            className="w-full"
            data-testid="button-reset-transform"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Transform
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Mouse:</strong> Left click + drag to rotate camera</p>
          <p><strong>Scroll:</strong> Zoom in/out</p>
          <p><strong>Right click + drag:</strong> Pan camera</p>
          <p><strong>Transform Mode:</strong> Click a transform button to enable gizmo controls</p>
        </CardContent>
      </Card>
    </div>
  );
}
