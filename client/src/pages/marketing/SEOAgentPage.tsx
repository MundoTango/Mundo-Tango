import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Search, TrendingUp, Link, FileText, BarChart3, Target } from "lucide-react";
import { motion } from "framer-motion";

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
    <>
      <SEO
        title="SEO Agent - Marketing Dashboard"
        description="Track SEO performance, keyword rankings, and organic growth with AI-powered insights."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SEO Agent</h1>
                <p className="text-muted-foreground">Your AI SEO optimization assistant</p>
              </div>
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {metrics.map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className={`h-8 w-8 ${metric.color}`} />
                      <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Keywords */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Top Performing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topKeywords.map((kw, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{kw.keyword}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        kw.difficulty === "High" ? "bg-red-500/20 text-red-500"
                        : kw.difficulty === "Medium" ? "bg-orange-500/20 text-orange-500"
                        : "bg-green-500/20 text-green-500"
                      }`}>
                        {kw.difficulty}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Position: #{kw.position}</span>
                      <span>•</span>
                      <span>{kw.volume.toLocaleString()} searches/mo</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-view-all-keywords">
                  View All Keywords
                </Button>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  AI SEO Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      rec.priority === "critical" ? "bg-red-500/5 border-red-500/20"
                      : rec.priority === "high" ? "bg-orange-500/5 border-orange-500/20"
                      : "bg-blue-500/5 border-blue-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{rec.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === "critical" ? "bg-red-500/20 text-red-500"
                        : rec.priority === "high" ? "bg-orange-500/20 text-orange-500"
                        : "bg-blue-500/20 text-blue-500"
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Impact: {rec.impact}</span>
                      <span>•</span>
                      <span>Effort: {rec.effort}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-generate-seo-report">
                  Generate Full SEO Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
