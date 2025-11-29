import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useKYC, EmploymentInfo } from '@/contexts/KYCContext';
import { toast } from 'sonner';
import { useState } from 'react';

const schema = z.object({
  occupation: z.string().min(2, 'Occupation is required').max(100),
  employer: z.string().min(2, 'Employer name is required').max(100),
  annualIncome: z.string().min(1, 'Annual income range is required'),
  sourceOfFunds: z.string().min(10, 'Please describe your source of funds').max(500),
  sourceOfWealth: z.string().min(10, 'Please describe your source of wealth').max(500),
});

export const EmploymentStep = () => {
  const { kycData, updateEmploymentInfo, setCurrentStep, submitStep } = useKYC();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmploymentInfo>({
    resolver: zodResolver(schema),
    defaultValues: kycData.employmentInfo,
  });

  const annualIncome = watch('annualIncome');

  const onSubmit = async (data: EmploymentInfo) => {
    try {
      setIsSubmitting(true);
      updateEmploymentInfo(data);
      await submitStep(4, data);
      toast.success('KYC onboarding completed successfully!', {
        description: 'Your information has been submitted for review.',
      });
      // In a real app, redirect to success page or dashboard
    } catch (error) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="occupation">Occupation / Profession *</Label>
            <Input
              id="occupation"
              {...register('occupation')}
              placeholder="e.g., Software Engineer"
              className="mt-1.5"
            />
            {errors.occupation && (
              <p className="text-sm text-destructive mt-1">{errors.occupation.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="employer">Employer *</Label>
            <Input
              id="employer"
              {...register('employer')}
              placeholder="Company name"
              className="mt-1.5"
            />
            {errors.employer && (
              <p className="text-sm text-destructive mt-1">{errors.employer.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="annualIncome">Annual Income Range *</Label>
          <Select
            value={annualIncome}
            onValueChange={(value) => setValue('annualIncome', value)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select income range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-50k">$0 - $50,000</SelectItem>
              <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
              <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
              <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
              <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
              <SelectItem value="1m+">$1,000,000+</SelectItem>
            </SelectContent>
          </Select>
          {errors.annualIncome && (
            <p className="text-sm text-destructive mt-1">{errors.annualIncome.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="sourceOfFunds">Source of Funds *</Label>
          <Textarea
            id="sourceOfFunds"
            {...register('sourceOfFunds')}
            placeholder="Describe where your funds come from (e.g., salary, business income, investments)"
            className="mt-1.5 min-h-24"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Explain the origin of the funds you will be using for transactions
          </p>
          {errors.sourceOfFunds && (
            <p className="text-sm text-destructive mt-1">{errors.sourceOfFunds.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="sourceOfWealth">Source of Wealth *</Label>
          <Textarea
            id="sourceOfWealth"
            {...register('sourceOfWealth')}
            placeholder="Describe how you accumulated your overall wealth (e.g., employment, inheritance, business ownership, investments)"
            className="mt-1.5 min-h-24"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Explain the activities that have generated your total net worth
          </p>
          {errors.sourceOfWealth && (
            <p className="text-sm text-destructive mt-1">{errors.sourceOfWealth.message}</p>
          )}
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
          <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
            Why do we need employment & income information?
          </h4>
          <p className="text-xs text-green-800 dark:text-green-200">
            This information helps us assess risk levels and comply with anti-money laundering (AML) regulations. 
            Understanding the source of your funds and wealth is a crucial part of the KYC process.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(3)}
          size="lg"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg" className="min-w-[180px]">
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete KYC
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
