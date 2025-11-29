import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, CheckCircle, Lock, FileCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">SnapAML</span>
          </Link>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/verify")}>
              Verify Badge
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/signup")}>Sign Up</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get Your Verified KYC Badge</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Complete our KYC verification once and use your verified badge across multiple financial partners. Trusted
            by banks, accountants, and financial institutions.
          </p>
          <Button size="lg" onClick={() => navigate("/signup")} className="text-lg px-8 py-6">
            Start Verification
          </Button>
        </div>
      </div>
    </div>
  );
}
