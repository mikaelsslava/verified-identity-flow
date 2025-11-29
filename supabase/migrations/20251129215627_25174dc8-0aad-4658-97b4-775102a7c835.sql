-- Allow users to create verification requests
CREATE POLICY "Users can create verification requests" 
ON public.kyb_requests 
FOR INSERT 
WITH CHECK (auth.email() = requester_email);