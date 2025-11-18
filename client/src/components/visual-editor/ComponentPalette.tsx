/**
 * Enhanced Component Palette
 * 20+ draggable components organized by category with search and recently used
 */

import { useState, useMemo } from "react";
import { Search, Clock } from "lucide-react";
import * as Icons from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ComponentType, ComponentCategory } from "./types";
import { componentDefinitions } from "./componentTemplates";

interface ComponentPaletteProps {
  onDragStart: (type: ComponentType) => void;
  recentlyUsed?: ComponentType[];
}

export function ComponentPalette({ onDragStart, recentlyUsed = [] }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | 'all' | 'recent'>('all');

  const handleDragStart = (type: ComponentType) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('componentType', type);
    
    // Create drag preview
    const preview = document.createElement('div');
    preview.className = 'px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-lg';
    preview.textContent = componentDefinitions.find(c => c.type === type)?.label || type;
    preview.style.position = 'absolute';
    preview.style.top = '-1000px';
    document.body.appendChild(preview);
    e.dataTransfer.setDragImage(preview, 0, 0);
    
    setTimeout(() => document.body.removeChild(preview), 0);
    
    onDragStart(type);
  };

  // Filter components based on search and category
  const filteredComponents = useMemo(() => {
    let components = componentDefinitions;

    // Filter by category
    if (activeCategory !== 'all' && activeCategory !== 'recent') {
      components = components.filter(c => c.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      components = components.filter(c => 
        c.label.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.type.toLowerCase().includes(query)
      );
    }

    return components;
  }, [searchQuery, activeCategory]);

  // Get recently used components
  const recentComponents = useMemo(() => {
    return recentlyUsed
      .map(type => componentDefinitions.find(c => c.type === type))
      .filter(Boolean)
      .slice(0, 5);
  }, [recentlyUsed]);

  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon || Icons.Square;
  };

  return (
    <div className="w-80 border-r border-ocean-divider bg-card flex flex-col h-full" data-testid="component-palette">
      {/* Header */}
      <div className="p-4 border-b border-ocean-divider">
        <h3 className="text-sm font-semibold mb-3">Component Library</h3>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
            data-testid="input-component-search"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-5 rounded-none border-b border-ocean-divider bg-muted/50 p-0 h-auto">
          <TabsTrigger value="all" className="rounded-none text-xs" data-testid="tab-all">
            All
          </TabsTrigger>
          <TabsTrigger value="recent" className="rounded-none text-xs" data-testid="tab-recent">
            <Clock className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="layout" className="rounded-none text-xs" data-testid="tab-layout">
            Layout
          </TabsTrigger>
          <TabsTrigger value="content" className="rounded-none text-xs" data-testid="tab-content">
            Content
          </TabsTrigger>
          <TabsTrigger value="interactive" className="rounded-none text-xs" data-testid="tab-interactive">
            Interactive
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="all" className="m-0 p-4">
            <ComponentGrid 
              components={filteredComponents}
              onDragStart={handleDragStart}
              getIcon={getIcon}
            />
          </TabsContent>

          <TabsContent value="recent" className="m-0 p-4">
            {recentComponents.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">Recently used components</p>
                <ComponentGrid 
                  components={recentComponents as any}
                  onDragStart={handleDragStart}
                  getIcon={getIcon}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No recently used components</p>
                <p className="text-xs text-muted-foreground mt-1">Drag components to see them here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="layout" className="m-0 p-4">
            <ComponentGrid 
              components={filteredComponents}
              onDragStart={handleDragStart}
              getIcon={getIcon}
            />
          </TabsContent>

          <TabsContent value="content" className="m-0 p-4">
            <ComponentGrid 
              components={filteredComponents}
              onDragStart={handleDragStart}
              getIcon={getIcon}
            />
          </TabsContent>

          <TabsContent value="interactive" className="m-0 p-4">
            <ComponentGrid 
              components={filteredComponents}
              onDragStart={handleDragStart}
              getIcon={getIcon}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer Help Text */}
      <div className="p-4 border-t border-ocean-divider bg-muted/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Drag components onto the preview to add them to your page. Click on any component to edit its properties.
        </p>
      </div>
    </div>
  );
}

interface ComponentGridProps {
  components: any[];
  onDragStart: (type: ComponentType) => (e: React.DragEvent) => void;
  getIcon: (iconName: string) => any;
}

function ComponentGrid({ components, onDragStart, getIcon }: ComponentGridProps) {
  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No components found</p>
        <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-3">
        {components.map(component => {
          const Icon = getIcon(component.icon);
          return (
            <Tooltip key={component.type} delayDuration={300}>
              <TooltipTrigger asChild>
                <div
                  draggable
                  onDragStart={onDragStart(component.type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-ocean-divider bg-card hover-elevate active-elevate-2 cursor-move transition-all group"
                  data-testid={`palette-${component.type}`}
                >
                  {/* Icon Preview */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs font-medium text-center leading-tight">
                    {component.label}
                  </span>
                  
                  {/* Category Badge */}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {component.category}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium mb-1">{component.label}</p>
                <p className="text-xs text-muted-foreground">{component.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
