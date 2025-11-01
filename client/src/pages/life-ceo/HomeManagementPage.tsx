import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Home, Wrench, ShoppingCart, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function HomeManagementPage() {
  const maintenance = [
    { task: "Change AC filter", due: "in 5 days", priority: "medium", status: "pending" },
    { task: "Water heater inspection", due: "in 12 days", priority: "low", status: "pending" },
    { task: "Garden maintenance", due: "Overdue by 2 days", priority: "high", status: "overdue" }
  ];

  const shopping = [
    { item: "Groceries", category: "Food", needed: "Weekly restock" },
    { item: "Light bulbs", category: "Hardware", needed: "Living room × 2" },
    { item: "Cleaning supplies", category: "Household", needed: "Monthly restock" }
  ];

  return (
    <PageLayout title="Home Management" showBreadcrumbs>
<>
      <SEO
        title="Home Management - Life CEO"
        description="Track home maintenance, shopping lists, and household tasks with your AI home agent."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your smart home assistant</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Maintenance Tasks */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Maintenance Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {maintenance.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      item.status === "overdue" 
                        ? "bg-red-500/5 border-red-500/20" 
                        : "hover-elevate"
                    }`}
                    data-testid={`maintenance-${idx}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{item.task}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.priority === "high" ? "bg-red-500/10 text-red-500" :
                        item.priority === "medium" ? "bg-orange-500/10 text-orange-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      {item.status === "overdue" ? (
                        <>
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span className="text-red-500">{item.due}</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3 w-3" />
                          <span>{item.due}</span>
                        </>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="w-full" data-testid={`button-complete-${idx}`}>
                      <CheckCircle2 className="h-3 w-3 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-maintenance">
                  + Add Maintenance Task
                </Button>
              </CardContent>
            </Card>

            {/* Shopping List */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Shopping List
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shopping.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border hover-elevate"
                    data-testid={`shopping-${idx}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{item.item}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.needed}</p>
                    <Button size="sm" variant="outline" className="w-full" data-testid={`button-buy-${idx}`}>
                      Add to Cart
                    </Button>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-item">
                  + Add Item
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}
