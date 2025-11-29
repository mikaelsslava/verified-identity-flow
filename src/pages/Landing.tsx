import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, CheckCircle, Lock, FileCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
            <Button variant="ghost" onClick={() => navigate('/verify')}>
              Verify Badge
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get Your Verified KYC Badge
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Complete our KYC verification once and use your verified badge across multiple financial partners. 
            Trusted by banks, accountants, and financial institutions.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')} className="text-lg px-8 py-6">
            Start Verification
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="p-6">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">One-Time Verification</h3>
            <p className="text-muted-foreground">
              Complete the KYC process once and get a reusable verification badge for all your financial needs.
            </p>
          </Card>
          
          <Card className="p-6">
            <Lock className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your data is encrypted and stored securely. We comply with all AML and data protection regulations.
            </p>
          </Card>
          
          <Card className="p-6">
            <FileCheck className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Widely Accepted</h3>
            <p className="text-muted-foreground">
              Present your verified badge to banks, accountants, and other AML-obligated partners instantly.
            </p>
          </Card>
        </div>

        {/* How it Works */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="space-y-6 text-left">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Provide Your Information</h4>
                <p className="text-muted-foreground">
                  Fill out our secure multi-step form with your personal, identification, tax, and employment details.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Upload Documents</h4>
                <p className="text-muted-foreground">
                  Submit your identification documents for verification. All uploads are encrypted and secure.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Get Your Badge</h4>
                <p className="text-muted-foreground">
                  Once verified, receive your KYC badge to share with any financial partner requiring AML compliance.
                </p>
              </div>
            </div>
          </div>
          
          <Button size="lg" onClick={() => navigate('/signup')} className="mt-12 text-lg px-8 py-6">
            Begin Verification Process
          </Button>
        </div>
      </div>
    </div>
  );
}
