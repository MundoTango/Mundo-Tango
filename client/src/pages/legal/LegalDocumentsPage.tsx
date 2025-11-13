import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Grid3x3,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Download,
  Trash2,
  Share2,
  Folder,
  Tag,
  HardDrive,
} from "lucide-react";
import { DocumentCard } from "@/components/legal/DocumentCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

export default function LegalDocumentsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/legal/documents', { type: filterType, status: filterStatus }],
  });

  const mockDocuments = [
    {
      id: 1,
      title: "Event Liability Waiver - Tango Festival 2024",
      type: "Waiver",
      status: "pending",
      lastModified: new Date("2024-01-15"),
      participants: 3,
      signedCount: 1,
      totalSignatures: 3,
    },
    {
      id: 2,
      title: "Teacher Employment Contract - Maria González",
      type: "Contract",
      status: "signed",
      lastModified: new Date("2024-01-14"),
      participants: 2,
      signedCount: 2,
      totalSignatures: 2,
    },
    {
      id: 3,
      title: "Venue Rental Agreement - La Milonga Space",
      type: "Agreement",
      status: "draft",
      lastModified: new Date("2024-01-13"),
      participants: 0,
    },
    {
      id: 4,
      title: "Participant Release Form - Workshop Series",
      type: "Release",
      status: "signed",
      lastModified: new Date("2024-01-12"),
      participants: 15,
      signedCount: 15,
      totalSignatures: 15,
    },
    {
      id: 5,
      title: "IP Agreement - Photography Rights",
      type: "IP Agreement",
      status: "pending",
      lastModified: new Date("2024-01-11"),
      participants: 2,
      signedCount: 0,
      totalSignatures: 2,
    },
  ];

  const handleSelectAll = () => {
    if (selectedDocs.length === mockDocuments.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(mockDocuments.map(d => d.id));
    }
  };

  const handleSelectDoc = (id: number) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = () => {
    console.log('Downloading documents:', selectedDocs);
  };

  const handleBulkDelete = () => {
    console.log('Deleting documents:', selectedDocs);
  };

  const handleBulkShare = () => {
    console.log('Sharing documents:', selectedDocs);
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2">Document Library</h1>
          <p className="text-muted-foreground">
            Manage and organize all your legal documents
          </p>
        </div>

        <Button asChild>
          <Link href="/legal/templates">
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Link>
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="waiver">Waivers</SelectItem>
                <SelectItem value="agreement">Agreements</SelectItem>
                <SelectItem value="release">Releases</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Modified</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                size="icon"
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedDocs.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedDocs.length === mockDocuments.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="font-medium">
                  {selectedDocs.length} document{selectedDocs.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Usage */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Storage</span>
            </div>
            <span className="text-sm text-muted-foreground">2.4 GB / 10 GB</span>
          </div>
          <Progress value={24} className="h-2" />
        </CardContent>
      </Card>

      {/* Documents Grid/List */}
      <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
        {mockDocuments.map((doc) => (
          <div key={doc.id} className="relative group">
            <div className="absolute top-4 left-4 z-10">
              <Checkbox
                checked={selectedDocs.includes(doc.id)}
                onCheckedChange={() => handleSelectDoc(doc.id)}
                className="bg-background"
              />
            </div>
            <Link href={`/legal/documents/${doc.id}`}>
              <DocumentCard {...doc} />
            </Link>
          </div>
        ))}
      </div>

      {mockDocuments.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first document
            </p>
            <Button asChild>
              <Link href="/legal/templates">
                <Plus className="w-4 h-4 mr-2" />
                Create Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
