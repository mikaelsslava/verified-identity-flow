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
    // Mock API call - replace with your actual backend endpoint
    try {
      const response = await fetch(`/api/kyc/step/${step}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit step');
      }

      return await response.json();
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
