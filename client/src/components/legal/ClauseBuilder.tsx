import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Clause {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface ClauseBuilderProps {
  initialClauses?: Clause[];
  onChange: (clauses: Clause[]) => void;
}

export function ClauseBuilder({ initialClauses = [], onChange }: ClauseBuilderProps) {
  const [clauses, setClauses] = useState<Clause[]>(initialClauses);

  const addClause = () => {
    const newClause: Clause = {
      id: `clause-${Date.now()}`,
      title: "",
      content: "",
      order: clauses.length,
    };
    const updated = [...clauses, newClause];
    setClauses(updated);
    onChange(updated);
  };

  const updateClause = (id: string, field: 'title' | 'content', value: string) => {
    const updated = clauses.map(clause =>
      clause.id === id ? { ...clause, [field]: value } : clause
    );
    setClauses(updated);
    onChange(updated);
  };

  const removeClause = (id: string) => {
    const updated = clauses.filter(clause => clause.id !== id);
    const reordered = updated.map((clause, index) => ({ ...clause, order: index }));
    setClauses(reordered);
    onChange(reordered);
  };

  const moveClause = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= clauses.length) return;

    const updated = [...clauses];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    const reordered = updated.map((clause, i) => ({ ...clause, order: i }));
    setClauses(reordered);
    onChange(reordered);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Legal Clauses</CardTitle>
          <Button onClick={addClause} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Clause
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {clauses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No clauses added yet. Click "Add Clause" to begin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clauses.map((clause, index) => (
              <Card key={clause.id} className="overflow-hidden">
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1 pt-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 cursor-move"
                        disabled={index === 0}
                        onClick={() => moveClause(index, 'up')}
                      >
                        <GripVertical className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 cursor-move"
                        disabled={index === clauses.length - 1}
                        onClick={() => moveClause(index, 'down')}
                      >
                        <GripVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <Input
                          placeholder="Clause title"
                          value={clause.title}
                          onChange={(e) => updateClause(clause.id, 'title', e.target.value)}
                          className="flex-1"
                        />
                      </div>

                      <Textarea
                        placeholder="Clause content..."
                        value={clause.content}
                        onChange={(e) => updateClause(clause.id, 'content', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeClause(clause.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
