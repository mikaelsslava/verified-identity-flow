import { useKYC } from '@/contexts/KYCContext';
import { ProgressIndicator } from './ProgressIndicator';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { IdentificationStep } from './steps/IdentificationStep';
import { TaxInfoStep } from './steps/TaxInfoStep';
import { EmploymentStep } from './steps/EmploymentStep';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const stepTitles = [
  {
    title: 'Personal Information',
    description: 'Tell us about yourself',
  },
  {
    title: 'Identification',
    description: 'Verify your identity',
  },
  {
    title: 'Tax Information',
    description: 'Tax residency and compliance',
  },
  {
    title: 'Employment & Income',
    description: 'Financial background information',
  },
];

export const KYCWizard = () => {
  const { currentStep } = useKYC();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <IdentificationStep />;
      case 3:
        return <TaxInfoStep />;
      case 4:
        return <EmploymentStep />;
      default:
        return <PersonalInfoStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
          <p className="text-muted-foreground">
            Complete your verification to access your reusable KYC badge
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
