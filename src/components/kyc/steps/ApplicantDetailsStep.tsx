import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKYC, ApplicantDetails } from '@/contexts/KYCContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  applicantFirstName: z.string().min(1, 'First name is required'),
  applicantLastName: z.string().min(1, 'Last name is required'),
  applicantEmail: z.string().email('Invalid email address'),
});

export const ApplicantDetailsStep = () => {
  const { kybData, updateApplicantDetails, setCurrentStep, submitStep } = useKYC();
  const navigate = useNavigate();

  const form = useForm<ApplicantDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: kybData.applicantDetails,
  });

  const onSubmit = async (data: ApplicantDetails) => {
    try {
      await submitStep(4, data);
      updateApplicantDetails(data);
      toast.success('Application completed successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormDescription className="text-base">
          Please provide the details of the person submitting this application
        </FormDescription>

        <FormField
          control={form.control}
          name="applicantFirstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input placeholder="Enter first name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applicantLastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input placeholder="Enter last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applicantEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="applicant@company.com" {...field} />
              </FormControl>
              <FormDescription>
                We'll use this email for verification and communication
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
            Back
          </Button>
          <Button type="submit">Complete Application</Button>
        </div>
      </form>
    </Form>
  );
};
