import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Search, TrendingUp, Link, FileText, BarChart3, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import seoHeroImg from "@assets/stock_images/professional_office__e56fc639.jpg";
import seoImg1 from "@assets/stock_images/professional_office__ac13e3df.jpg";
import seoImg2 from "@assets/stock_images/professional_office__6787b655.jpg";

export default function SEOAgentPage() {
  const metrics = [
    { label: "Organic Traffic", value: "12,450", change: "+15.3%", icon: TrendingUp, color: "text-green-500" },
    { label: "Keyword Rankings", value: "284", change: "+12", icon: Search, color: "text-blue-500" },
    { label: "Backlinks", value: "1,847", change: "+23", icon: Link, color: "text-purple-500" },
    { label: "Page Authority", value: "68/100", change: "+4", icon: Target, color: "text-orange-500" }
  ];

  const topKeywords = [
    { keyword: "tango lessons online", position: 3, volume: 8100, difficulty: "Medium" },
    { keyword: "tango community", position: 5, volume: 5400, difficulty: "Low" },
    { keyword: "find tango teacher", position: 8, volume: 3200, difficulty: "High" },
    { keyword: "tango events near me", position: 12, volume: 2900, difficulty: "Medium" }
  ];

  const recommendations = [
    { title: "Optimize 'Tango Lessons' Page", impact: "High", effort: "Low", priority: "critical" },
    { title: "Build More Internal Links", impact: "Medium", effort: "Low", priority: "high" },
    { title: "Improve Mobile Page Speed", impact: "High", effort: "Medium", priority: "high" },
    { title: "Create Tango Blog Content", impact: "Medium", effort: "High", priority: "medium" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="SEO Agent" fallbackRoute="/platform">
    <PageLayout title="SEO Agent" showBreadcrumbs>
<>
      <SEO
        title="SEO Agent - Marketing Dashboard"
        description="Track SEO performance, keyword rankings, and organic growth with AI-powered insights."
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${seoHeroImg}')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-marketing">
              Marketing AI
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              SEO Agent
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Intelligent SEO optimization - track rankings, analyze keywords, and dominate search results
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Metrics Grid */}
        <div className="grid gap-8 md:grid-cols-4 mb-16">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                    <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured SEO Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">SEO Insights</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Keywords Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={seoImg1}
                  alt="Keyword Performance"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Top Keywords</h3>
                  <p className="text-white/80 text-sm mt-1">Ranking positions and search volume</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {topKeywords.map((kw, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`keyword-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{kw.keyword}</h4>
                      <Badge className={
                        kw.difficulty === "High" ? "bg-red-500"
                        : kw.difficulty === "Medium" ? "bg-orange-500"
                        : "bg-green-500"
                      }>
                        {kw.difficulty}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Position: #{kw.position}</span>
                      <span>•</span>
                      <span>{kw.volume.toLocaleString()} searches/mo</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full gap-2" variant="outline" data-testid="button-view-all-keywords">
                  <Search className="w-4 h-4" />
                  View All Keywords
                </Button>
              </CardContent>
            </Card>

            {/* Recommendations Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={seoImg2}
                  alt="AI Recommendations"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">AI Recommendations</h3>
                  <p className="text-white/80 text-sm mt-1">Prioritized optimization opportunities</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border hover-elevate"
                    data-testid={`recommendation-${idx}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <Badge className={
                        rec.priority === "critical" ? "bg-red-500"
                        : rec.priority === "high" ? "bg-orange-500"
                        : "bg-blue-500"
                      }>
                        {rec.priority}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Impact: {rec.impact}</span>
                      <span>•</span>
                      <span>Effort: {rec.effort}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full gap-2" data-testid="button-generate-seo-report">
                  <Sparkles className="w-4 h-4" />
                  Generate Full SEO Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
