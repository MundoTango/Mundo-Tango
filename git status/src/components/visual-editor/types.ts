/**
 * Visual Page Editor Types
 * Component definitions for drag-drop page builder with 20+ components
 */

// Expanded component type definitions
export type ComponentType = 
  // Layout (5)
  | 'container' 
  | 'flex-row' 
  | 'flex-column' 
  | 'grid-2x2' 
  | 'grid-3x3' 
  | 'section'
  // Content (6)
  | 'heading' 
  | 'paragraph' 
  | 'image' 
  | 'video' 
  | 'code-block' 
  | 'divider'
  // Interactive (5)
  | 'button' 
  | 'input' 
  | 'textarea' 
  | 'select' 
  | 'checkbox'
  // Navigation (4)
  | 'link' 
  | 'breadcrumbs' 
  | 'tabs' 
  | 'navbar';

export type ComponentCategory = 'layout' | 'content' | 'interactive' | 'navigation';

export interface ComponentDefinition {
  type: ComponentType;
  category: ComponentCategory;
  label: string;
  description: string;
  icon: string;
  defaultHtml: string;
  defaultClasses: string;
  thumbnail?: string;
}

export interface BaseComponent {
  id: string;
  type: ComponentType;
  children?: PageComponent[];
}

export interface HeadingComponent extends BaseComponent {
  type: 'heading';
  properties: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
    align: 'left' | 'center' | 'right';
    color: string;
  };
}

export interface TextComponent extends BaseComponent {
  type: 'paragraph';
  properties: {
    text: string;
    fontSize: string;
    color: string;
    align: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface ImageComponent extends BaseComponent {
  type: 'image';
  properties: {
    src: string;
    alt: string;
    width: string;
    height: string;
    objectFit: 'cover' | 'contain' | 'fill' | 'none';
  };
}

export interface ButtonComponent extends BaseComponent {
  type: 'button';
  properties: {
    text: string;
    variant: 'default' | 'outline' | 'ghost' | 'secondary';
    size: 'sm' | 'default' | 'lg';
    href?: string;
  };
}

export interface ContainerComponent extends BaseComponent {
  type: 'container';
  properties: {
    layout: 'flex' | 'grid';
    direction: 'row' | 'column';
    gap: string;
    padding: string;
    backgroundColor: string;
    borderRadius: string;
  };
}

export type PageComponent = 
  | HeadingComponent 
  | TextComponent 
  | ImageComponent 
  | ButtonComponent 
  | ContainerComponent;

export interface PageData {
  id: string;
  name: string;
  components: PageComponent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DragDropPosition {
  x: number;
  y: number;
  targetElement?: HTMLElement;
  insertPosition?: 'before' | 'after' | 'inside';
}

export interface ComponentInsertionData {
  type: ComponentType;
  html: string;
  position: DragDropPosition;
  testId: string;
}
