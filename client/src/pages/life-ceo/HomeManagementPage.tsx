import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Home, Wrench, ShoppingCart, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import heroImage from "@assets/optimized/IMG_9171-optimized.jpg";

export default function HomeManagementPage() {
  const { t } = useTranslation(["pages", "common"]);
  const maintenance = [
    { task: t('pages:lifeceo.home.maintenance.changeAcFilter', 'Change AC filter'), due: t('pages:lifeceo.home.due.in5days', 'in 5 days'), priority: "medium", status: "pending" },
    { task: t('pages:lifeceo.home.maintenance.waterHeater', 'Water heater inspection'), due: t('pages:lifeceo.home.due.in12days', 'in 12 days'), priority: "low", status: "pending" },
    { task: t('pages:lifeceo.home.maintenance.garden', 'Garden maintenance'), due: t('pages:lifeceo.home.due.overdue2days', 'Overdue by 2 days'), priority: "high", status: "overdue" }
  ];

  const shopping = [
    { item: t('pages:lifeceo.home.shopping.groceries', 'Groceries'), category: t('pages:lifeceo.home.category.food', 'Food'), needed: t('pages:lifeceo.home.needed.weeklyRestock', 'Weekly restock') },
    { item: t('pages:lifeceo.home.shopping.lightBulbs', 'Light bulbs'), category: t('pages:lifeceo.home.category.hardware', 'Hardware'), needed: t('pages:lifeceo.home.needed.livingRoom', 'Living room × 2') },
    { item: t('pages:lifeceo.home.shopping.cleaningSupplies', 'Cleaning supplies'), category: t('pages:lifeceo.home.category.household', 'Household'), needed: t('pages:lifeceo.home.needed.monthlyRestock', 'Monthly restock') }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <SelfHealingErrorBoundary pageName="LifeCEOHomeManagement" fallbackRoute="/life-ceo">
      <PageLayout title={t('pages:lifeceo.home.title', 'Home Management')} showBreadcrumbs>
        <>
      <SEO
        title={t('pages:lifeceo.home.seoTitle', 'Home Management - Life CEO')}
        description={t('pages:lifeceo.home.seoDescription', 'Track home maintenance, shopping lists, and household tasks with your AI home agent.')}
      />

      <div className="min-h-screen">
        {/* Editorial Hero Section - 16:9 */}
        <section className="relative h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${heroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 mx-auto">
                <Home className="h-8 w-8 text-orange-400" />
              </div>
              
              <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                {t('pages:lifeceo.home.badge', 'Life CEO · Home')}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
                {t('pages:lifeceo.home.heroTitle', 'Home Management')}
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                {t('pages:lifeceo.home.heroSubtitle', 'Your smart home assistant for maintenance and organization')}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-6 py-16">

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Maintenance Tasks */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  {t('pages:lifeceo.home.maintenanceSchedule', 'Maintenance Schedule')}
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
                        {t(`pages:lifeceo.home.priority.${item.priority}`, item.priority)}
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
                      {t('pages:lifeceo.home.markComplete', 'Mark Complete')}
                    </Button>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-maintenance">
                  {t('pages:lifeceo.home.addMaintenanceTask', '+ Add Maintenance Task')}
                </Button>
              </CardContent>
            </Card>

            {/* Shopping List */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  {t('pages:lifeceo.home.shoppingList', 'Shopping List')}
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
                      {t('pages:lifeceo.home.addToCart', 'Add to Cart')}
                    </Button>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-item">
                  {t('pages:lifeceo.home.addItem', '+ Add Item')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
