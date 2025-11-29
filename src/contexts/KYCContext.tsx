import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CompanyDetails {
  companyName: string;
  tradesUnderDifferentName: boolean;
  tradingName: string;
  companyRegistrationNumber: string;
  companyRegistrationDate: Date | undefined;
  entityType: string;
  websiteOrBusinessChannel: string;
}

export interface IndustryInfo {
  countryOfRegistration: string;
  industry: string;
  subIndustry: string;
  goodsOrServices: string;
}

export interface TransactionInfo {
  incomingPaymentsMonthlyEuro: string;
  incomingPaymentCountries: string;
  incomingTransactionAmount: string;
  outgoingPaymentsMonthlyEuro: string;
  outgoingPaymentCountries: string;
  outgoingTransactionAmount: string;
}

export interface ApplicantDetails {
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
}

interface KYBData {
  companyDetails: Partial<CompanyDetails>;
  industryInfo: Partial<IndustryInfo>;
  transactionInfo: Partial<TransactionInfo>;
  applicantDetails: Partial<ApplicantDetails>;
}

interface KYCContextType {
  currentStep: number;
  kybData: KYBData;
  isLoading: boolean;
  setCurrentStep: (step: number) => void;
  updateCompanyDetails: (data: Partial<CompanyDetails>) => void;
  updateIndustryInfo: (data: Partial<IndustryInfo>) => void;
  updateTransactionInfo: (data: Partial<TransactionInfo>) => void;
  updateApplicantDetails: (data: Partial<ApplicantDetails>) => void;
  submitStep: (step: number, data: any) => Promise<void>;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const KYCProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kybData, setKYBData] = useState<KYBData>({
    companyDetails: {},
    industryInfo: {},
    transactionInfo: {},
    applicantDetails: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load existing submission on mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: submission } = await supabase
            .from('kyb_submissions')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (submission) {
            // Populate kybData from submission
            setKYBData({
              companyDetails: {
                companyName: submission.company_name || '',
                tradesUnderDifferentName: submission.trades_under_different_name || false,
                tradingName: submission.trading_name || '',
                companyRegistrationNumber: submission.company_registration_number || '',
                companyRegistrationDate: submission.company_registration_date 
                  ? new Date(submission.company_registration_date) 
                  : undefined,
                entityType: submission.entity_type || '',
                websiteOrBusinessChannel: submission.website_or_business_channel || '',
              },
              industryInfo: {
                countryOfRegistration: submission.country_of_registration || '',
                industry: submission.industry || '',
                subIndustry: submission.sub_industry || '',
                goodsOrServices: submission.goods_or_services || '',
              },
              transactionInfo: {
                incomingPaymentsMonthlyEuro: submission.incoming_payments_monthly_euro || '',
                incomingPaymentCountries: submission.incoming_payment_countries || '',
                incomingTransactionAmount: submission.incoming_transaction_amount || '',
                outgoingPaymentsMonthlyEuro: submission.outgoing_payments_monthly_euro || '',
                outgoingPaymentCountries: submission.outgoing_payment_countries || '',
                outgoingTransactionAmount: submission.outgoing_transaction_amount || '',
              },
              applicantDetails: {
                applicantFirstName: submission.applicant_first_name || '',
                applicantLastName: submission.applicant_last_name || '',
                applicantEmail: submission.applicant_email || '',
              },
            });

            // Determine current step based on completed steps
            if (submission.step_4_completed) {
              // If all steps completed, redirect to profile
              window.location.href = '/profile';
              return;
            } else if (submission.step_3_completed) {
              setCurrentStep(4);
            } else if (submission.step_2_completed) {
              setCurrentStep(3);
            } else if (submission.step_1_completed) {
              setCurrentStep(2);
            }
          }
        }
      } catch (error) {
        console.error('Error loading existing submission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, []);

  const updateCompanyDetails = (data: Partial<CompanyDetails>) => {
    setKYBData((prev) => ({
      ...prev,
      companyDetails: { ...prev.companyDetails, ...data },
    }));
  };

  const updateIndustryInfo = (data: Partial<IndustryInfo>) => {
    setKYBData((prev) => ({
      ...prev,
      industryInfo: { ...prev.industryInfo, ...data },
    }));
  };

  const updateTransactionInfo = (data: Partial<TransactionInfo>) => {
    setKYBData((prev) => ({
      ...prev,
      transactionInfo: { ...prev.transactionInfo, ...data },
    }));
  };

  const updateApplicantDetails = (data: Partial<ApplicantDetails>) => {
    setKYBData((prev) => ({
      ...prev,
      applicantDetails: { ...prev.applicantDetails, ...data },
    }));
  };

  const submitStep = async (step: number, data: any) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Prepare the data based on the step
      const updateData: any = {
        user_id: user.id,
      };

      if (step === 1) {
        updateData.company_name = data.companyName;
        updateData.trades_under_different_name = data.tradesUnderDifferentName;
        updateData.trading_name = data.tradingName;
        updateData.company_registration_number = data.companyRegistrationNumber;
        updateData.company_registration_date = data.companyRegistrationDate?.toISOString().split('T')[0];
        updateData.entity_type = data.entityType;
        updateData.website_or_business_channel = data.websiteOrBusinessChannel;
        updateData.step_1_completed = true;
      } else if (step === 2) {
        updateData.country_of_registration = data.countryOfRegistration;
        updateData.industry = data.industry;
        updateData.sub_industry = data.subIndustry;
        updateData.goods_or_services = data.goodsOrServices;
        updateData.step_2_completed = true;
      } else if (step === 3) {
        updateData.incoming_payments_monthly_euro = data.incomingPaymentsMonthlyEuro;
        updateData.incoming_payment_countries = data.incomingPaymentCountries;
        updateData.incoming_transaction_amount = data.incomingTransactionAmount;
        updateData.outgoing_payments_monthly_euro = data.outgoingPaymentsMonthlyEuro;
        updateData.outgoing_payment_countries = data.outgoingPaymentCountries;
        updateData.outgoing_transaction_amount = data.outgoingTransactionAmount;
        updateData.step_3_completed = true;
      } else if (step === 4) {
        updateData.applicant_first_name = data.applicantFirstName;
        updateData.applicant_last_name = data.applicantLastName;
        updateData.applicant_email = data.applicantEmail;
        updateData.step_4_completed = true;
      }

      const { error } = await supabase
        .from('kyb_submissions')
        .upsert(updateData, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error submitting step:', error);
      throw error;
    }
  };

  return (
    <KYCContext.Provider
      value={{
        currentStep,
        kybData,
        isLoading,
        setCurrentStep,
        updateCompanyDetails,
        updateIndustryInfo,
        updateTransactionInfo,
        updateApplicantDetails,
        submitStep,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
};

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};
