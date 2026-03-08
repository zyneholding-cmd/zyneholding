import { useEffect, useState } from "react";
import {
  BarChart3, ShoppingCart, Users, Calendar, FileText, Zap,
  TrendingUp, Globe, Shield, Mail, Briefcase, Settings,
  PieChart, Layers, Target, Award, Cpu, Database,
} from "lucide-react";

const icons = [
  BarChart3, ShoppingCart, Users, Calendar, FileText, Zap,
  TrendingUp, Globe, Shield, Mail, Briefcase, Settings,
  PieChart, Layers, Target, Award, Cpu, Database,
];

interface FloatingIcon {
  id: number;
  Icon: typeof BarChart3;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export const AuthAnimation = () => {
  const [floatingIcons] = useState<FloatingIcon[]>(() =>
    icons.map((Icon, i) => ({
      id: i,
      Icon,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 20 + Math.random() * 24,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 8,
    }))
  );

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-secondary">
      {/* Animated background circles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Floating icons */}
      {floatingIcons.map(({ id, Icon, x, y, size, delay, duration }) => (
        <div
          key={id}
          className="absolute text-white/15 floating-icon"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        >
          <Icon style={{ width: size, height: size }} />
        </div>
      ))}

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 text-center">
        <div className="mb-8 relative">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <BarChart3 className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -inset-4 bg-white/5 rounded-3xl blur-xl animate-pulse" />
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          Zyne Holding
        </h1>
        <p className="text-lg text-white/70 max-w-md mb-8">
          200+ business tools. One powerful platform. Manage, grow, and scale your business effortlessly.
        </p>

        {/* Merging icons animation */}
        <div className="flex items-center gap-3 mb-8">
          {[ShoppingCart, TrendingUp, Users, Globe, Zap].map((Icon, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 merge-icon"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Global</span>
          </div>
        </div>
      </div>
    </div>
  );
};
