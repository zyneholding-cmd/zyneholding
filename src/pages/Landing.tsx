import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart3, Shield, Users, Zap, TrendingUp, Lock, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="relative">
              <BarChart3 className="h-8 w-8 text-primary animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 bg-primary/20 blur-xl animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Zyne Holding
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-foreground/70 hover:text-primary transition-colors font-medium">Home</a>
            <a href="#features" className="text-foreground/70 hover:text-primary transition-colors font-medium">Features</a>
            <a href="#about" className="text-foreground/70 hover:text-primary transition-colors font-medium">About</a>
            <a href="#pricing" className="text-foreground/70 hover:text-primary transition-colors font-medium">Pricing</a>
            <a href="#contact" className="text-foreground/70 hover:text-primary transition-colors font-medium">Contact</a>
          </div>

          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="animate-fade-in hover-scale"
          >
            Join Zyne Holding
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-slide-in">
              Manage Your Business
              <br />
              Like Never Before
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The most powerful sales dashboard with AI assistance, real-time analytics, and multi-currency support
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6 hover-scale shadow-elegant"
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 hover-scale"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Floating Cards Animation */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="card-shadow p-6 rounded-xl bg-card animate-fade-in hover-scale transition-all duration-300">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">Track your sales, profits, and inventory in real-time</p>
            </div>
            <div className="card-shadow p-6 rounded-xl bg-card animate-fade-in hover-scale transition-all duration-300" style={{ animationDelay: '0.1s' }}>
              <Zap className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">AI Assistant</h3>
              <p className="text-muted-foreground">Get intelligent insights and recommendations</p>
            </div>
            <div className="card-shadow p-6 rounded-xl bg-card animate-fade-in hover-scale transition-all duration-300" style={{ animationDelay: '0.2s' }}>
              <Globe className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Multi-Currency</h3>
              <p className="text-muted-foreground">Support for multiple currencies worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary/5">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 animate-fade-in">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Secure & Protected", desc: "Bank-level security for your data" },
              { icon: Users, title: "Multi-User", desc: "Each user manages their own business" },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Deep insights into your business" },
              { icon: Lock, title: "Password Protected", desc: "Additional layer of security" },
              { icon: TrendingUp, title: "Inventory Tracking", desc: "Never run out of stock" },
              { icon: Zap, title: "Lightning Fast", desc: "Optimized for performance" },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="card-shadow p-8 rounded-xl bg-card hover-scale animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <feature.icon className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 animate-fade-in">
            About Zyne Holding
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-8 animate-fade-in">
            We're revolutionizing business management with cutting-edge technology and intuitive design. 
            Our platform empowers entrepreneurs and businesses of all sizes to track sales, manage inventory, 
            and make data-driven decisions with confidence.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 animate-fade-in">
            Simple Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Starter", price: "Free", features: ["Up to 100 products", "Basic analytics", "Email support"] },
              { name: "Pro", price: "$29", features: ["Unlimited products", "Advanced analytics", "Priority support", "AI assistant"] },
              { name: "Enterprise", price: "Custom", features: ["Everything in Pro", "Custom integrations", "Dedicated support", "Custom features"] },
            ].map((plan, idx) => (
              <div 
                key={idx}
                className={`card-shadow p-8 rounded-xl bg-card hover-scale animate-fade-in ${idx === 1 ? 'border-2 border-primary' : ''}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={idx === 1 ? "default" : "outline"}>
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team Section */}
      <section id="join" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 space-y-6">
              <div className="flex justify-center gap-2">
                {[Briefcase, Users, Zap].map((Icon, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                ))}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Join Our Team
              </h2>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                Are you talented, motivated, and ready to make an impact? We're looking for developers, designers, marketers, and business professionals to join Zyne Holding.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/join')}
                  className="text-lg px-10 py-6 hover-scale bg-white text-primary hover:bg-white/90"
                >
                  Apply Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-6 hover-scale border-white/30 text-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 animate-fade-in">
            Get In Touch
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Have questions? We'd love to hear from you.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 hover-scale">
            Contact Us
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Zyne Holding. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
