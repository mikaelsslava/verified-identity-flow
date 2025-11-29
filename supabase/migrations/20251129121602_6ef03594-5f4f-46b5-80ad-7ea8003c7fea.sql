-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Set completed_at when all steps are completed
  IF NEW.step_1_completed AND NEW.step_2_completed AND NEW.step_3_completed AND NEW.step_4_completed THEN
    NEW.completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;