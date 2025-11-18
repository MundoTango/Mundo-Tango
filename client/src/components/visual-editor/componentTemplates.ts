/**
 * Component Templates Generator
 * Generates HTML with Tailwind styling for all 20+ component types
 */

import type { ComponentType, ComponentDefinition } from './types';

export function generateComponentHTML(type: ComponentType, testId: string): string {
  const templates: Record<ComponentType, string> = {
    // ===== LAYOUT COMPONENTS =====
    'container': `
      <div 
        data-testid="${testId}" 
        class="p-6 border border-ocean-divider rounded-lg bg-card"
        data-component-type="container"
      >
        <p class="text-sm text-muted-foreground">Container - Drop components here</p>
      </div>
    `,
    
    'flex-row': `
      <div 
        data-testid="${testId}" 
        class="flex flex-row gap-4 p-4 border border-ocean-divider rounded-lg"
        data-component-type="flex-row"
      >
        <div class="flex-1 p-4 bg-muted rounded-md">Column 1</div>
        <div class="flex-1 p-4 bg-muted rounded-md">Column 2</div>
      </div>
    `,
    
    'flex-column': `
      <div 
        data-testid="${testId}" 
        class="flex flex-col gap-4 p-4 border border-ocean-divider rounded-lg"
        data-component-type="flex-column"
      >
        <div class="p-4 bg-muted rounded-md">Row 1</div>
        <div class="p-4 bg-muted rounded-md">Row 2</div>
      </div>
    `,
    
    'grid-2x2': `
      <div 
        data-testid="${testId}" 
        class="grid grid-cols-2 gap-4 p-4 border border-ocean-divider rounded-lg"
        data-component-type="grid-2x2"
      >
        <div class="p-4 bg-muted rounded-md">Grid Item 1</div>
        <div class="p-4 bg-muted rounded-md">Grid Item 2</div>
        <div class="p-4 bg-muted rounded-md">Grid Item 3</div>
        <div class="p-4 bg-muted rounded-md">Grid Item 4</div>
      </div>
    `,
    
    'grid-3x3': `
      <div 
        data-testid="${testId}" 
        class="grid grid-cols-3 gap-4 p-4 border border-ocean-divider rounded-lg"
        data-component-type="grid-3x3"
      >
        ${Array.from({length: 9}, (_, i) => 
          `<div class="p-4 bg-muted rounded-md">Grid Item ${i + 1}</div>`
        ).join('')}
      </div>
    `,
    
    'section': `
      <section 
        data-testid="${testId}" 
        class="py-12 px-6 border-b border-ocean-divider"
        data-component-type="section"
      >
        <h2 class="text-2xl font-semibold mb-4">Section Heading</h2>
        <p class="text-muted-foreground">Section content goes here</p>
      </section>
    `,
    
    // ===== CONTENT COMPONENTS =====
    'heading': `
      <h2 
        data-testid="${testId}" 
        class="text-3xl font-bold"
        data-component-type="heading"
        contenteditable="true"
      >
        Your Heading Text
      </h2>
    `,
    
    'paragraph': `
      <p 
        data-testid="${testId}" 
        class="text-base leading-7"
        data-component-type="paragraph"
        contenteditable="true"
      >
        This is a paragraph of text. Click to edit the content directly.
      </p>
    `,
    
    'image': `
      <div 
        data-testid="${testId}" 
        class="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-ocean-divider"
        data-component-type="image"
      >
        <img 
          src="https://placehold.co/800x450/2c5f7d/ffffff?text=Image+Placeholder" 
          alt="Placeholder image" 
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
          <span class="text-white text-sm">Click to change image</span>
        </div>
      </div>
    `,
    
    'video': `
      <div 
        data-testid="${testId}" 
        class="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-ocean-divider"
        data-component-type="video"
      >
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-muted-foreground">Video Embed</p>
          </div>
        </div>
      </div>
    `,
    
    'code-block': `
      <div 
        data-testid="${testId}" 
        class="relative rounded-lg bg-muted border border-ocean-divider overflow-hidden"
        data-component-type="code-block"
      >
        <div class="px-4 py-2 bg-muted-foreground/10 border-b border-ocean-divider text-xs font-mono text-muted-foreground">
          code.tsx
        </div>
        <pre class="p-4 overflow-x-auto"><code class="text-sm font-mono">function example() {
  console.log("Hello, World!");
  return true;
}</code></pre>
      </div>
    `,
    
    'divider': `
      <hr 
        data-testid="${testId}" 
        class="my-6 border-ocean-divider"
        data-component-type="divider"
      />
    `,
    
    // ===== INTERACTIVE COMPONENTS =====
    'button': `
      <button 
        data-testid="${testId}" 
        class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2 font-medium"
        data-component-type="button"
      >
        Click Me
      </button>
    `,
    
    'input': `
      <div 
        data-testid="${testId}-wrapper" 
        class="w-full max-w-sm"
        data-component-type="input"
      >
        <label class="block text-sm font-medium mb-2">Input Label</label>
        <input 
          data-testid="${testId}"
          type="text" 
          placeholder="Enter text here..." 
          class="w-full px-3 py-2 border border-ocean-divider rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    `,
    
    'textarea': `
      <div 
        data-testid="${testId}-wrapper" 
        class="w-full max-w-sm"
        data-component-type="textarea"
      >
        <label class="block text-sm font-medium mb-2">Textarea Label</label>
        <textarea 
          data-testid="${testId}"
          rows="4" 
          placeholder="Enter longer text here..." 
          class="w-full px-3 py-2 border border-ocean-divider rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        ></textarea>
      </div>
    `,
    
    'select': `
      <div 
        data-testid="${testId}-wrapper" 
        class="w-full max-w-sm"
        data-component-type="select"
      >
        <label class="block text-sm font-medium mb-2">Select Label</label>
        <select 
          data-testid="${testId}"
          class="w-full px-3 py-2 border border-ocean-divider rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
        </select>
      </div>
    `,
    
    'checkbox': `
      <div 
        data-testid="${testId}-wrapper" 
        class="flex items-center gap-2"
        data-component-type="checkbox"
      >
        <input 
          data-testid="${testId}"
          type="checkbox" 
          id="${testId}-input"
          class="w-4 h-4 border-ocean-divider rounded focus:ring-2 focus:ring-primary"
        />
        <label for="${testId}-input" class="text-sm">Checkbox Label</label>
      </div>
    `,
    
    // ===== NAVIGATION COMPONENTS =====
    'link': `
      <a 
        data-testid="${testId}" 
        href="#" 
        class="text-primary hover:underline font-medium"
        data-component-type="link"
      >
        Link Text
      </a>
    `,
    
    'breadcrumbs': `
      <nav 
        data-testid="${testId}" 
        class="flex items-center gap-2 text-sm"
        data-component-type="breadcrumbs"
      >
        <a href="#" class="text-primary hover:underline">Home</a>
        <span class="text-muted-foreground">/</span>
        <a href="#" class="text-primary hover:underline">Category</a>
        <span class="text-muted-foreground">/</span>
        <span class="text-foreground font-medium">Current Page</span>
      </nav>
    `,
    
    'tabs': `
      <div 
        data-testid="${testId}" 
        class="w-full"
        data-component-type="tabs"
      >
        <div class="flex border-b border-ocean-divider">
          <button class="px-4 py-2 border-b-2 border-primary font-medium text-primary">Tab 1</button>
          <button class="px-4 py-2 border-b-2 border-transparent hover-elevate">Tab 2</button>
          <button class="px-4 py-2 border-b-2 border-transparent hover-elevate">Tab 3</button>
        </div>
        <div class="p-4 bg-card border border-t-0 border-ocean-divider rounded-b-lg">
          Tab content goes here
        </div>
      </div>
    `,
    
    'navbar': `
      <nav 
        data-testid="${testId}" 
        class="flex items-center justify-between p-4 bg-card border-b border-ocean-divider"
        data-component-type="navbar"
      >
        <div class="flex items-center gap-8">
          <span class="text-lg font-bold">Logo</span>
          <div class="flex gap-6">
            <a href="#" class="text-sm hover:text-primary">Home</a>
            <a href="#" class="text-sm hover:text-primary">About</a>
            <a href="#" class="text-sm hover:text-primary">Contact</a>
          </div>
        </div>
        <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-elevate">
          Sign In
        </button>
      </nav>
    `
  };

  return templates[type] || `<div data-testid="${testId}">Unknown component type: ${type}</div>`;
}

export const componentDefinitions: ComponentDefinition[] = [
  // LAYOUT CATEGORY
  {
    type: 'container',
    category: 'layout',
    label: 'Container',
    description: 'Basic container with padding and border',
    icon: 'Package',
    defaultHtml: '',
    defaultClasses: 'p-6 border border-ocean-divider rounded-lg bg-card'
  },
  {
    type: 'flex-row',
    category: 'layout',
    label: 'Flex Row',
    description: 'Horizontal flex layout with 2 columns',
    icon: 'Columns',
    defaultHtml: '',
    defaultClasses: 'flex flex-row gap-4'
  },
  {
    type: 'flex-column',
    category: 'layout',
    label: 'Flex Column',
    description: 'Vertical flex layout',
    icon: 'AlignVertical',
    defaultHtml: '',
    defaultClasses: 'flex flex-col gap-4'
  },
  {
    type: 'grid-2x2',
    category: 'layout',
    label: 'Grid 2x2',
    description: '2 column grid layout',
    icon: 'Grid2x2',
    defaultHtml: '',
    defaultClasses: 'grid grid-cols-2 gap-4'
  },
  {
    type: 'grid-3x3',
    category: 'layout',
    label: 'Grid 3x3',
    description: '3 column grid layout',
    icon: 'Grid3x3',
    defaultHtml: '',
    defaultClasses: 'grid grid-cols-3 gap-4'
  },
  {
    type: 'section',
    category: 'layout',
    label: 'Section',
    description: 'Page section with header',
    icon: 'Layout',
    defaultHtml: '',
    defaultClasses: 'py-12 px-6'
  },
  
  // CONTENT CATEGORY
  {
    type: 'heading',
    category: 'content',
    label: 'Heading',
    description: 'Text heading (H1-H6)',
    icon: 'Type',
    defaultHtml: '',
    defaultClasses: 'text-3xl font-bold'
  },
  {
    type: 'paragraph',
    category: 'content',
    label: 'Paragraph',
    description: 'Body text paragraph',
    icon: 'AlignLeft',
    defaultHtml: '',
    defaultClasses: 'text-base leading-7'
  },
  {
    type: 'image',
    category: 'content',
    label: 'Image',
    description: 'Image placeholder',
    icon: 'Image',
    defaultHtml: '',
    defaultClasses: 'w-full aspect-video'
  },
  {
    type: 'video',
    category: 'content',
    label: 'Video',
    description: 'Video embed placeholder',
    icon: 'Video',
    defaultHtml: '',
    defaultClasses: 'w-full aspect-video'
  },
  {
    type: 'code-block',
    category: 'content',
    label: 'Code Block',
    description: 'Formatted code display',
    icon: 'Code2',
    defaultHtml: '',
    defaultClasses: 'rounded-lg bg-muted'
  },
  {
    type: 'divider',
    category: 'content',
    label: 'Divider',
    description: 'Horizontal rule separator',
    icon: 'Minus',
    defaultHtml: '',
    defaultClasses: 'my-6 border-ocean-divider'
  },
  
  // INTERACTIVE CATEGORY
  {
    type: 'button',
    category: 'interactive',
    label: 'Button',
    description: 'Action button',
    icon: 'Square',
    defaultHtml: '',
    defaultClasses: 'px-4 py-2 bg-primary text-primary-foreground rounded-md'
  },
  {
    type: 'input',
    category: 'interactive',
    label: 'Input Field',
    description: 'Text input field',
    icon: 'FormInput',
    defaultHtml: '',
    defaultClasses: 'w-full px-3 py-2 border rounded-md'
  },
  {
    type: 'textarea',
    category: 'interactive',
    label: 'Textarea',
    description: 'Multi-line text input',
    icon: 'FileText',
    defaultHtml: '',
    defaultClasses: 'w-full px-3 py-2 border rounded-md'
  },
  {
    type: 'select',
    category: 'interactive',
    label: 'Select Dropdown',
    description: 'Dropdown selection',
    icon: 'ChevronDown',
    defaultHtml: '',
    defaultClasses: 'w-full px-3 py-2 border rounded-md'
  },
  {
    type: 'checkbox',
    category: 'interactive',
    label: 'Checkbox',
    description: 'Checkbox with label',
    icon: 'CheckSquare',
    defaultHtml: '',
    defaultClasses: 'flex items-center gap-2'
  },
  
  // NAVIGATION CATEGORY
  {
    type: 'link',
    category: 'navigation',
    label: 'Link',
    description: 'Hyperlink',
    icon: 'Link',
    defaultHtml: '',
    defaultClasses: 'text-primary hover:underline'
  },
  {
    type: 'breadcrumbs',
    category: 'navigation',
    label: 'Breadcrumbs',
    description: 'Navigation breadcrumb trail',
    icon: 'ChevronRight',
    defaultHtml: '',
    defaultClasses: 'flex items-center gap-2'
  },
  {
    type: 'tabs',
    category: 'navigation',
    label: 'Tab Group',
    description: 'Tabbed navigation',
    icon: 'Tabs',
    defaultHtml: '',
    defaultClasses: 'w-full'
  },
  {
    type: 'navbar',
    category: 'navigation',
    label: 'Navbar',
    description: 'Navigation bar with menu',
    icon: 'Menu',
    defaultHtml: '',
    defaultClasses: 'flex items-center justify-between p-4'
  }
];
