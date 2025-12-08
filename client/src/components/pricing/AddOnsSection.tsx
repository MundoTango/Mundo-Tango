import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, HardDrive, BarChart3, Palette } from "lucide-react";
import { motion } from "framer-motion";

interface AddOn {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: typeof Plane;
}

const addOns: AddOn[] = [
  {
    id: "travel-planner",
    title: "Travel Planner",
    description: "Plan your tango journeys with AI-powered recommendations for milongas, festivals, and accommodation worldwide.",
    price: "$4.99",
    icon: Plane,
  },
  {
    id: "premium-storage",
    title: "Premium Storage",
    description: "Store unlimited photos, videos, and practice recordings with 100GB of cloud storage for your tango memories.",
    price: "$2.99",
    icon: HardDrive,
  },
  {
    id: "advanced-analytics",
    title: "Advanced Analytics",
    description: "Track your progress with detailed analytics on practice time, partner dances, and skill development.",
    price: "$6.99",
    icon: BarChart3,
  },
  {
    id: "custom-branding",
    title: "Custom Branding",
    description: "Personalize your profile and event pages with custom themes, logos, and branded elements.",
    price: "$14.99",
    icon: Palette,
  },
];

export function AddOnsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      data-testid="section-addons"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif font-bold mb-4" data-testid="text-addons-title">
          Enhance Your Experience
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto" data-testid="text-addons-subtitle">
          Add powerful features to any plan to customize your tango journey.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-testid="grid-addons">
        {addOns.map((addon, index) => {
          const IconComponent = addon.icon;
          return (
            <motion.div
              key={addon.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover-elevate" data-testid={`card-addon-${addon.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" data-testid={`icon-addon-${addon.id}`} />
                    </div>
                    <CardTitle className="text-lg font-semibold" data-testid={`text-addon-title-${addon.id}`}>
                      {addon.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-addon-description-${addon.id}`}>
                    {addon.description}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-2xl font-bold" data-testid={`text-addon-price-${addon.id}`}>
                      {addon.price}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-add-addon-${addon.id}`}
                    >
                      Add to Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
