-- Create a generic updated_at function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create requests table
CREATE TABLE public.kyb_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_email text NOT NULL,
  company_registration_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kyb_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to view requests for their company
CREATE POLICY "Users can view requests for their company"
ON public.kyb_requests
FOR SELECT
USING (
  company_registration_number IN (
    SELECT company_registration_number 
    FROM public.kyb_submissions 
    WHERE user_id = auth.uid()
  )
);

-- Policy for users to update requests for their company
CREATE POLICY "Users can update requests for their company"
ON public.kyb_requests
FOR UPDATE
USING (
  company_registration_number IN (
    SELECT company_registration_number 
    FROM public.kyb_submissions 
    WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_kyb_requests_updated_at
BEFORE UPDATE ON public.kyb_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();