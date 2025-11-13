import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, FileText, Star } from "lucide-react";
import { TemplateCard } from "@/components/legal/TemplateCard";

export default function LegalTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/legal/templates', { category: selectedCategory }],
  });

  const categories = [
    { id: "all", name: "All Templates", count: 12 },
    { id: "event_waiver", name: "Event Waivers", count: 3 },
    { id: "contract", name: "Employment Contracts", count: 2 },
    { id: "venue", name: "Venue Agreements", count: 2 },
    { id: "release", name: "Participant Releases", count: 2 },
    { id: "ip", name: "IP Agreements", count: 2 },
    { id: "other", name: "Other", count: 1 },
  ];

  const mockTemplates = [
    {
      id: 1,
      title: "Event Liability Waiver",
      description: "Comprehensive liability waiver for tango events, workshops, and festivals. Includes standard risk acknowledgment, medical authorization, and photo release clauses.",
      category: "Event Waiver",
      usageCount: 156,
      isPremium: false,
      price: 0,
    },
    {
      id: 2,
      title: "Teacher Employment Contract",
      description: "Professional agreement for hiring tango instructors. Covers compensation, schedule, responsibilities, intellectual property, and termination terms.",
      category: "Contract",
      usageCount: 89,
      isPremium: true,
      price: 29.99,
    },
    {
      id: 3,
      title: "Venue Rental Agreement",
      description: "Standard contract for renting dance spaces. Includes terms for milongas, practicas, and private events with liability and damage clauses.",
      category: "Agreement",
      usageCount: 124,
      isPremium: false,
      price: 0,
    },
    {
      id: 4,
      title: "Participant Release Form",
      description: "Simple release form for workshop participants. Covers basic liability and emergency contact information.",
      category: "Release",
      usageCount: 203,
      isPremium: false,
      price: 0,
    },
    {
      id: 5,
      title: "Intellectual Property Agreement",
      description: "Protects choreography, teaching methods, and creative content. Essential for professional dancers and teachers.",
      category: "IP Agreement",
      usageCount: 45,
      isPremium: true,
      price: 49.99,
    },
    {
      id: 6,
      title: "Photo/Video Release",
      description: "Consent form for photography and videography at events. Includes social media and marketing usage rights.",
      category: "Release",
      usageCount: 187,
      isPremium: false,
      price: 0,
    },
    {
      id: 7,
      title: "Music Licensing Agreement",
      description: "Agreement for using recorded music at events. Covers performance rights and royalty obligations.",
      category: "IP Agreement",
      usageCount: 67,
      isPremium: true,
      price: 39.99,
    },
    {
      id: 8,
      title: "Festival Organizer Contract",
      description: "Comprehensive agreement for festival organizers and performers. Includes payment terms, cancellation policy, and rider requirements.",
      category: "Contract",
      usageCount: 34,
      isPremium: true,
      price: 59.99,
    },
  ];

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           template.category.toLowerCase().replace(/\s+/g, '_') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (templateId: number) => {
    // Navigate to document creation with template
    console.log('Using template:', templateId);
  };

  const handlePreviewTemplate = (templateId: number) => {
    // Show template preview
    console.log('Previewing template:', templateId);
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2">Template Library</h1>
          <p className="text-muted-foreground">
            Professional legal templates for the tango community
          </p>
        </div>

        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Template
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="gap-2">
              {category.name}
              <span className="text-xs text-muted-foreground">({category.count})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Featured Templates */}
          {selectedCategory === "all" && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className="text-2xl font-bold font-serif">Featured Templates</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockTemplates.filter(t => t.isPremium).slice(0, 3).map((template) => (
                  <TemplateCard
                    key={template.id}
                    {...template}
                    onUse={() => handleUseTemplate(template.id)}
                    onPreview={() => handlePreviewTemplate(template.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div>
            <h2 className="text-2xl font-bold font-serif mb-4">
              {selectedCategory === "all" ? "All Templates" : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  {...template}
                  onUse={() => handleUseTemplate(template.id)}
                  onPreview={() => handlePreviewTemplate(template.id)}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <Card className="py-16 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Need a Custom Template?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Can't find the template you need? Create your own custom template with our easy-to-use editor, 
              or contact our legal team for assistance.
            </p>
            <div className="flex gap-2">
              <Button size="sm">
                Create Custom Template
              </Button>
              <Button size="sm" variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
