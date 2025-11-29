import { createContext, useContext, useState, ReactNode } from 'react';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | undefined;
  placeOfBirth: string;
  nationality: string;
  additionalCitizenships: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lengthOfResidence: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Identification {
  documentType: string;
  documentNumber: string;
  issuingCountry: string;
  expiryDate: Date | undefined;
  documentFile: File | null;
}

export interface TaxInfo {
  isUSPerson: boolean;
  taxResidencyCountries: string;
  taxIdentificationNumbers: string;
}

export interface EmploymentInfo {
  occupation: string;
  employer: string;
  annualIncome: string;
  sourceOfFunds: string;
  sourceOfWealth: string;
}

interface KYCData {
  personalInfo: Partial<PersonalInfo>;
  identification: Partial<Identification>;
  taxInfo: Partial<TaxInfo>;
  employmentInfo: Partial<EmploymentInfo>;
}

interface KYCContextType {
  currentStep: number;
  kycData: KYCData;
  setCurrentStep: (step: number) => void;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateIdentification: (data: Partial<Identification>) => void;
  updateTaxInfo: (data: Partial<TaxInfo>) => void;
  updateEmploymentInfo: (data: Partial<EmploymentInfo>) => void;
  submitStep: (step: number, data: any) => Promise<void>;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const KYCProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycData, setKYCData] = useState<KYCData>({
    personalInfo: {},
    identification: {},
    taxInfo: {},
    employmentInfo: {},
  });

  const updatePersonalInfo = (data: Partial<PersonalInfo>) => {
    setKYCData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  };

  const updateIdentification = (data: Partial<Identification>) => {
    setKYCData((prev) => ({
      ...prev,
      identification: { ...prev.identification, ...data },
    }));
  };

  const updateTaxInfo = (data: Partial<TaxInfo>) => {
    setKYCData((prev) => ({
      ...prev,
      taxInfo: { ...prev.taxInfo, ...data },
    }));
  };

  const updateEmploymentInfo = (data: Partial<EmploymentInfo>) => {
    setKYCData((prev) => ({
      ...prev,
      employmentInfo: { ...prev.employmentInfo, ...data },
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
        updateData.first_name = data.firstName;
        updateData.last_name = data.lastName;
        updateData.date_of_birth = data.dateOfBirth?.toISOString().split('T')[0];
        updateData.place_of_birth = data.placeOfBirth;
        updateData.nationality = data.nationality;
        updateData.additional_citizenships = data.additionalCitizenships;
        updateData.address_line1 = data.addressLine1;
        updateData.address_line2 = data.addressLine2;
        updateData.city = data.city;
        updateData.state = data.state;
        updateData.postal_code = data.postalCode;
        updateData.country = data.country;
        updateData.length_of_residence = data.lengthOfResidence;
        updateData.contact_email = data.contactEmail;
        updateData.contact_phone = data.contactPhone;
        updateData.step_1_completed = true;
      } else if (step === 2) {
        updateData.document_type = data.documentType;
        updateData.document_number = data.documentNumber;
        updateData.issuing_country = data.issuingCountry;
        updateData.document_expiry_date = data.expiryDate?.toISOString().split('T')[0];
        updateData.step_2_completed = true;
      } else if (step === 3) {
        updateData.is_us_person = data.isUSPerson;
        updateData.tax_residency_countries = data.taxResidencyCountries;
        updateData.tax_identification_numbers = data.taxIdentificationNumbers;
        updateData.step_3_completed = true;
      } else if (step === 4) {
        updateData.occupation = data.occupation;
        updateData.employer = data.employer;
        updateData.annual_income = data.annualIncome;
        updateData.source_of_funds = data.sourceOfFunds;
        updateData.source_of_wealth = data.sourceOfWealth;
        updateData.step_4_completed = true;
      }

      const { error } = await supabase
        .from('kyc_submissions')
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
        kycData,
        setCurrentStep,
        updatePersonalInfo,
        updateIdentification,
        updateTaxInfo,
        updateEmploymentInfo,
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
