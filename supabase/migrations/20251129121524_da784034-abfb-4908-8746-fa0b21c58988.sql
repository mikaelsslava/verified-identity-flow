-- Create KYC submissions table
CREATE TABLE public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  place_of_birth TEXT,
  nationality TEXT,
  additional_citizenships TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  length_of_residence TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Identification
  document_type TEXT,
  document_number TEXT,
  issuing_country TEXT,
  document_expiry_date DATE,
  document_file_url TEXT,
  
  -- Tax Information
  is_us_person BOOLEAN,
  tax_residency_countries TEXT,
  tax_identification_numbers TEXT,
  
  -- Employment Information
  occupation TEXT,
  employer TEXT,
  annual_income TEXT,
  source_of_funds TEXT,
  source_of_wealth TEXT,
  
  -- Step completion tracking
  step_1_completed BOOLEAN DEFAULT FALSE,
  step_2_completed BOOLEAN DEFAULT FALSE,
  step_3_completed BOOLEAN DEFAULT FALSE,
  step_4_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Ensure one submission per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kyc_submissions
CREATE POLICY "Users can view their own KYC submission"
  ON public.kyc_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KYC submission"
  ON public.kyc_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYC submission"
  ON public.kyc_submissions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- RLS Policies for storage
CREATE POLICY "Users can upload their own documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'kyc-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'kyc-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'kyc-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Set completed_at when all steps are completed
  IF NEW.step_1_completed AND NEW.step_2_completed AND NEW.step_3_completed AND NEW.step_4_completed THEN
    NEW.completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kyc_submissions_updated_at
  BEFORE UPDATE ON public.kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();