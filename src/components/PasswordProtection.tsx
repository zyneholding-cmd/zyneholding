import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PASSWORD_KEY = "site_password_verified";

interface PasswordProtectionProps {
  children: React.ReactNode;
}

export const PasswordProtection = ({ children }: PasswordProtectionProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already unlocked in this session
    const verified = sessionStorage.getItem(PASSWORD_KEY);
    if (verified === "true") {
      setIsUnlocked(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-password', {
        body: { password }
      });

      if (error) throw error;

      if (data?.valid) {
        sessionStorage.setItem(PASSWORD_KEY, "true");
        setIsUnlocked(true);
        toast.success("Access granted!");
      } else {
        toast.error("Incorrect password");
        setPassword("");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      toast.error("Error verifying password");
      setPassword("");
    }
  };

  if (isLoading) {
    return null;
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold">Protected Access</h1>
              <p className="text-muted-foreground mt-2">
                Enter the password to access this website
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
                autoFocus
              />
              <Button type="submit" className="w-full" size="lg">
                Unlock
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
