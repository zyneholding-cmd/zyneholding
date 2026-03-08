import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { businessTools, categories } from "@/data/businessTools";
import { cn } from "@/lib/utils";
import {
  BarChart3, ArrowRight, CheckCircle, Shield, Zap, Globe, Users,
  Briefcase, ChevronDown, Star, Play,
} from "lucide-react";

const categoryDescriptions: Record<string, string> = {
  "Dashboard & Analytics": "Real-time insights, KPIs, forecasting & custom dashboards",
  "Sales & CRM": "Pipeline, leads, deals, loyalty programs & referral tracking",
  "Products & Inventory": "Stock management, suppliers, pricing, barcodes & catalogs",
  "Finance & Accounting": "Invoicing, payroll, taxes, budgeting & financial reports",
  "Team & HR": "Hiring, attendance, performance reviews, shifts & org charts",
  "Tasks & Projects": "Kanban, Gantt, sprints, roadmaps & time tracking",
  "Communication": "Chat, email, video calls, surveys & newsletters",
  "Documents & Files": "File sharing, contracts, e-signatures & version control",
  "Calendar & Scheduling": "Appointments, booking, reminders & meeting rooms",
  "Marketing & Social": "SEO, ads, social media, content & competitor analysis",
  "E-commerce": "Online store, orders, shipping, POS & marketplace",
  "Automation & Integration": "Workflows, API, webhooks, AI & data sync",
  "Security & Compliance": "Permissions, audit logs, 2FA, encryption & GDPR",
  "Support & Service": "Help desk, live chat, chatbot, FAQ & SLA management",
  "Mobile & Location": "Mobile app, GPS tracking, geofencing & route planning",
  "Media & Content": "Media library, video hosting, CMS & blog platform",
  "Advanced Features": "AI, ML, blockchain, IoT, AR/VR & quantum computing",
};

const categoryIcons: Record<string, any> = {
  "Dashboard & Analytics": BarChart3,
  "Sales & CRM": Users,
  "Products & Inventory": Briefcase,
  "Finance & Accounting": Shield,
  "Team & HR": Users,
  "Tasks & Projects": CheckCircle,
  "Communication": Globe,
  "Automation & Integration": Zap,
};

const stats = [
  { value: "200+", label: "Business Tools" },
  { value: "14", label: "Categories" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8);
  const toolCount = businessTools.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Zyne Holding
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tools</a>
            <a href="#categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Categories</a>
            <a href="#join" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Join Business</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="text-sm">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="text-sm">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-3.5 w-3.5" />
            {toolCount}+ Business Tools in One Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
            Everything Your Business
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Needs to Succeed
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
            From sales tracking to AI predictions, manage every aspect of your business
            with our comprehensive suite of {toolCount}+ integrated tools.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-12 animate-fade-in">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-base px-8 h-12 hover-scale">
              Start Free <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12 hover-scale">
              <Play className="h-4 w-4 mr-1" /> Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in">
            {stats.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border">
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Overview Ticker */}
      <section id="tools" className="py-12 overflow-hidden border-y bg-muted/30">
        <div className="flex gap-3 animate-[scroll_60s_linear_infinite]" style={{ width: "max-content" }}>
          {[...businessTools.slice(0, 40), ...businessTools.slice(0, 40)].map((tool, i) => {
            const Icon = tool.icon;
            return (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border whitespace-nowrap text-sm">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">{tool.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {toolCount}+ Tools Across {categories.length} Categories
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every tool you need, organized and interconnected. Pick what fits your business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleCategories.map((cat) => {
              const catTools = businessTools.filter(t => t.category === cat);
              const implemented = catTools.filter(t => t.isImplemented).length;
              const isOpen = activeCategory === cat;

              return (
                <div
                  key={cat}
                  className={cn(
                    "rounded-xl border bg-card p-5 transition-all cursor-pointer hover:shadow-md",
                    isOpen && "ring-2 ring-primary shadow-md"
                  )}
                  onClick={() => setActiveCategory(isOpen ? null : cat)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {(() => {
                        const FirstIcon = catTools[0]?.icon || BarChart3;
                        return <FirstIcon className="h-5 w-5 text-primary" />;
                      })()}
                    </div>
                    <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full">
                      {catTools.length} tools
                    </span>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1 text-sm">{cat}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {categoryDescriptions[cat] || "Business management tools"}
                  </p>

                  {implemented > 0 && (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <CheckCircle className="h-3 w-3" />
                      {implemented} active
                    </div>
                  )}

                  {/* Expanded tools list */}
                  {isOpen && (
                    <div className="mt-4 pt-3 border-t space-y-1.5 max-h-48 overflow-y-auto">
                      {catTools.map(tool => {
                        const TIcon = tool.icon;
                        return (
                          <div key={tool.id} className="flex items-center gap-2 text-xs py-1">
                            <TIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={tool.isImplemented ? "text-foreground" : "text-muted-foreground"}>
                              {tool.name}
                            </span>
                            {tool.isImplemented && (
                              <CheckCircle className="h-3 w-3 text-success ml-auto" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!showAllCategories && categories.length > 8 && (
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => setShowAllCategories(true)}>
                Show All {categories.length} Categories
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Highlights */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Businesses Choose Zyne
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "All-in-One Platform",
                desc: `${toolCount}+ tools working together. No more juggling between apps—everything from CRM to accounting in one place.`,
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                desc: "Role-based access, encryption, audit logs, and compliance tools to keep your data safe.",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                desc: "Real-time messaging, task assignment, shared calendars, and workflow automation for seamless teamwork.",
              },
              {
                icon: Globe,
                title: "Multi-Currency & Global",
                desc: "Support for multiple currencies, time zones, and languages. Run your business anywhere.",
              },
              {
                icon: Star,
                title: "AI-Powered Insights",
                desc: "Predictive analytics, smart recommendations, and automated reporting powered by AI.",
              },
              {
                icon: Briefcase,
                title: "Business Marketplace",
                desc: "Publish your business, find talent, and grow your team through our built-in marketplace.",
              },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Business CTA */}
      <section id="join" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary p-10 md:p-14">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Join Zyne's Business
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  Browse published businesses, find opportunities matching your skills, or create your own business and find talent.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate("/join-business")}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Browse Businesses
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/auth")}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Create Your Business
                  </Button>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-3 gap-2">
                {businessTools.slice(0, 9).map((t, i) => {
                  const TIcon = t.icon;
                  return (
                    <div key={i} className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                      <TIcon className="h-6 w-6 text-white/70" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "Free", features: ["Up to 50 tools", "5 team members", "Basic analytics", "Email support"] },
              { name: "Pro", price: "$29", features: ["All {toolCount}+ tools", "Unlimited team", "AI insights", "Priority support", "Custom workflows"], popular: true },
              { name: "Enterprise", price: "Custom", features: ["Everything in Pro", "SSO & compliance", "Dedicated support", "Custom integrations", "SLA guarantee"] },
            ].map((plan, i) => (
              <div
                key={i}
                className={cn(
                  "p-6 rounded-xl bg-card border",
                  plan.popular && "border-primary ring-2 ring-primary/20 relative"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {plan.price}
                  <span className="text-sm text-muted-foreground font-normal">/mo</span>
                </div>
                <ul className="space-y-2 mt-4 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Run Your Business Smarter?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of businesses using {toolCount}+ tools to grow faster.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-base px-10 h-12 hover-scale">
            Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Zyne Holding</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; 2025 Zyne Holding. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
