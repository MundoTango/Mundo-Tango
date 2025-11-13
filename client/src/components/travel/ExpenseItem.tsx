import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Receipt, DollarSign, Users, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ExpenseItemProps {
  expense: {
    id: number;
    description: string;
    amount: number;
    currency?: string;
    category: string;
    date?: string;
    payer?: {
      id: number;
      name: string;
      profileImage?: string;
    };
    splitType?: "equal" | "custom" | "single";
    participants?: number;
    receiptUrl?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

const categoryColors: Record<string, string> = {
  accommodation: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  transport: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  food: "bg-green-500/10 text-green-600 border-green-500/20",
  activities: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  events: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const perPerson = expense.splitType === "equal" && expense.participants
    ? expense.amount / expense.participants
    : expense.amount;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`expense-item-${expense.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{expense.description}</h4>
                  <Badge className={categoryColors[expense.category] || categoryColors.other}>
                    {expense.category}
                  </Badge>
                </div>
                
                {expense.date && (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(expense.date)}
                  </p>
                )}

                {expense.payer && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={expense.payer.profileImage} />
                      <AvatarFallback className="text-xs">
                        {expense.payer.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      Paid by {expense.payer.name}
                    </span>
                  </div>
                )}

                {expense.splitType === "equal" && expense.participants && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      Split {expense.participants} ways
                      {" • "}
                      {expense.currency || "$"}{perPerson.toFixed(2)} per person
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold" data-testid={`text-expense-amount-${expense.id}`}>
                {expense.currency || "$"}{expense.amount.toFixed(2)}
              </p>
              {expense.receiptUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-xs mt-1"
                  data-testid={`button-view-receipt-${expense.id}`}
                >
                  <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                    View Receipt
                  </a>
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onEdit}
                  data-testid={`button-edit-expense-${expense.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onDelete}
                  data-testid={`button-delete-expense-${expense.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
