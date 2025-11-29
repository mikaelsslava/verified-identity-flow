import { useKYC } from '@/contexts/KYCContext';
import { ProgressIndicator } from './ProgressIndicator';
import { CompanyDetailsStep } from './steps/CompanyDetailsStep';
import { IndustryInfoStep } from './steps/IndustryInfoStep';
import { TransactionInfoStep } from './steps/TransactionInfoStep';
import { ApplicantDetailsStep } from './steps/ApplicantDetailsStep';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const stepTitles = [
  {
    title: 'Company Details',
    description: 'Basic company information',
  },
  {
    title: 'Industry & Business Type',
    description: 'What does your company do?',
  },
  {
    title: 'Transaction Information',
    description: 'Payment flow details',
  },
  {
    title: 'Applicant Details',
    description: 'Who is submitting this application?',
  },
];

export const KYCWizard = () => {
  const { currentStep } = useKYC();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanyDetailsStep />;
      case 2:
        return <IndustryInfoStep />;
      case 3:
        return <TransactionInfoStep />;
      case 4:
        return <ApplicantDetailsStep />;
      default:
        return <CompanyDetailsStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">SnapAML</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Business Verification</h1>
          <p className="text-muted-foreground">
            Complete your company verification to access your reusable KYB badge
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={4} />

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {stepTitles[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-base">
              {stepTitles[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Your information is encrypted and securely stored. We comply with GDPR, CCPA, and other privacy regulations.
          </p>
        </div>
      </div>
    </div>
  );
};
