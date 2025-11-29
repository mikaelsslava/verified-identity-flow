import { KYCProvider, useKYC } from '@/contexts/KYCContext';
import { KYCWizard } from '@/components/kyc/KYCWizard';

function KYCContent() {
  const { isLoading } = useKYC();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <KYCWizard />;
}

const Index = () => {
  return (
    <KYCProvider>
      <KYCContent />
    </KYCProvider>
  );
};

export default Index;
