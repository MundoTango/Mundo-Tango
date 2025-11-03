/**
 * Visual Page Editor Types
 * Component definitions for drag-drop page builder
 */

export type ComponentType = 'heading' | 'text' | 'image' | 'button' | 'container';

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
  type: 'text';
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
