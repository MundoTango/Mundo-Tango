/**
 * Command Suggestions Component
 * Displays all available voice commands organized by category
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Navigation, 
  Palette, 
  Bot, 
  FileText, 
  Settings,
  Mic,
  Sparkles
} from "lucide-react";

interface CommandCategory {
  name: string;
  icon: React.ReactNode;
  commands: string[];
  description: string;
}

export function CommandSuggestions() {
  const categories: CommandCategory[] = [
    {
      name: 'Navigation',
      icon: <Navigation className="w-4 h-4" />,
      description: 'Navigate between different pages',
      commands: [
        'go to home',
        'go to feed',
        'go to profile',
        'go to events',
        'go to messages',
        'go to settings',
        'go back',
        'go forward',
        'refresh page',
        'scroll to top',
      ],
    },
    {
      name: 'Visual Editor',
      icon: <Palette className="w-4 h-4" />,
      description: 'Edit and style elements',
      commands: [
        'make it bigger',
        'make it smaller',
        'change color to [color]',
        'add padding',
        'remove padding',
        'center it',
        'make it bold',
        'make it italic',
        'undo',
        'redo',
        'save changes',
        'discard changes',
        'show preview',
        'show code',
        'take screenshot',
      ],
    },
    {
      name: 'Mr. Blue',
      icon: <Bot className="w-4 h-4" />,
      description: 'Control AI assistant features',
      commands: [
        'start listening',
        'stop listening',
        'read last message',
        'clear conversation',
        'save conversation',
        'load conversation',
        'toggle continuous mode',
        'mute audio',
        'unmute audio',
        'show suggestions',
      ],
    },
    {
      name: 'Content',
      icon: <FileText className="w-4 h-4" />,
      description: 'Create and manage content',
      commands: [
        'create post',
        'create event',
        'upload photo',
        'upload video',
        'tag friends',
        'add location',
        'search for [query]',
        'filter by [filter]',
      ],
    },
    {
      name: 'System',
      icon: <Settings className="w-4 h-4" />,
      description: 'System and display settings',
      commands: [
        'what can you do',
        'help',
        'show commands',
        'dark mode',
        'light mode',
        'zoom in',
        'zoom out',
        'full screen',
        'exit full screen',
      ],
    },
  ];

  const totalCommands = categories.reduce((sum, cat) => sum + cat.commands.length, 0);

  return (
    <Card data-testid="card-command-suggestions">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          <CardTitle data-testid="title-voice-commands">Voice Commands</CardTitle>
        </div>
        <CardDescription data-testid="description-command-count">
          Say any of these {totalCommands} commands to control the app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="all" data-testid="tab-all-commands">
              All
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger 
                key={category.name} 
                value={category.name.toLowerCase()}
                data-testid={`tab-${category.name.toLowerCase()}`}
              >
                <span className="hidden lg:inline">{category.name}</span>
                <span className="lg:hidden">{category.icon}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category.name} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <h3 className="font-semibold text-lg" data-testid={`heading-${category.name.toLowerCase()}`}>
                        {category.name}
                      </h3>
                      <Badge variant="secondary" data-testid={`badge-count-${category.name.toLowerCase()}`}>
                        {category.commands.length}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.commands.map((cmd) => (
                        <Badge 
                          key={cmd} 
                          variant="outline"
                          className="hover-elevate cursor-default"
                          data-testid={`command-badge-${cmd.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {cmd}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent 
              key={category.name} 
              value={category.name.toLowerCase()}
              className="mt-4"
            >
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <h3 className="font-semibold text-lg">
                      {category.name}
                    </h3>
                    <Badge variant="secondary">
                      {category.commands.length} commands
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {category.commands.map((cmd) => (
                      <div
                        key={cmd}
                        className="p-3 rounded-lg border bg-card hover-elevate transition-all"
                        data-testid={`command-item-${cmd.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-muted-foreground" />
                          <code className="text-sm font-mono">{cmd}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Pro Tips
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Commands with [brackets] accept parameters (e.g., "search for coffee shops")</li>
            <li>Fuzzy matching allows slight variations in phrasing</li>
            <li>Enable continuous mode for hands-free operation</li>
            <li>Commands work in any context across the app</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
