import { Card } from "@/components/ui/card";
import { TrendingUp, Target, Users, Zap } from "lucide-react";

export const BusinessTips = () => {
  const tips = [
    {
      icon: TrendingUp,
      title: "Follow Up on Pending Payments",
      description: "Convert partial payments to full payments by sending friendly reminders to customers with outstanding balances.",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      icon: Target,
      title: "Focus on High-Profit Products",
      description: "Analyze which products generate the most profit and prioritize their marketing and inventory.",
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      icon: Users,
      title: "Build Customer Relationships",
      description: "Maintain a contact list and reach out to previous customers with new offers and seasonal promotions.",
      color: "text-warning",
      bg: "bg-warning/10"
    },
    {
      icon: Zap,
      title: "Offer Flexible Payment Options",
      description: "Customers with installment options are 40% more likely to complete purchases. Keep offering flexible terms.",
      color: "text-accent",
      bg: "bg-accent/10"
    }
  ];

  return (
    <Card className="p-4 md:p-6 animate-fade-in">
      <h3 className="text-base md:text-lg font-semibold mb-4">💡 Tips to Scale Your Sales</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div 
              key={index}
              className="flex gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`${tip.bg} ${tip.color} p-2 rounded-lg h-fit`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
