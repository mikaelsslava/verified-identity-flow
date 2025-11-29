-- Drop existing kyc_submissions table and recreate for company data
DROP TABLE IF EXISTS kyc_submissions CASCADE;

-- Create kyb_submissions table for company onboarding
CREATE TABLE public.kyb_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Step 1: Company Details
  company_name TEXT,
  trades_under_different_name BOOLEAN DEFAULT false,
  trading_name TEXT,
  company_registration_number TEXT,
  company_registration_date DATE,
  entity_type TEXT,
  website_or_business_channel TEXT,
  
  -- Step 2: Industry & Business Type
  country_of_registration TEXT,
  industry TEXT,
  sub_industry TEXT,
  goods_or_services TEXT,
  
  -- Step 3: Transaction Information
  incoming_payments_monthly_euro TEXT,
  incoming_payment_countries TEXT,
  incoming_transaction_amount TEXT,
  outgoing_payments_monthly_euro TEXT,
  outgoing_payment_countries TEXT,
  outgoing_transaction_amount TEXT,
  
  -- Step 4: Applicant Details
  applicant_first_name TEXT,
  applicant_last_name TEXT,
  applicant_email TEXT,
  
  -- Step completion tracking
  step_1_completed BOOLEAN DEFAULT false,
  step_2_completed BOOLEAN DEFAULT false,
  step_3_completed BOOLEAN DEFAULT false,
  step_4_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.kyb_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own KYB submission" 
  ON public.kyb_submissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KYB submission" 
  ON public.kyb_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYB submission" 
  ON public.kyb_submissions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_kyb_submissions_updated_at
  BEFORE UPDATE ON public.kyb_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();