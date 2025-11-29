import { KYCProvider } from '@/contexts/KYCContext';
import { KYCWizard } from '@/components/kyc/KYCWizard';

const Index = () => {
  return (
    <KYCProvider>
      <KYCWizard />
    </KYCProvider>
  );
};

export default Index;
