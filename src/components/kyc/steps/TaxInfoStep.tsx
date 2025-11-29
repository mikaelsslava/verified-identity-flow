import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useKYC, TaxInfo } from '@/contexts/KYCContext';
import { toast } from 'sonner';
import { useState } from 'react';

const schema = z.object({
  isUSPerson: z.boolean(),
  taxResidencyCountries: z.string().min(2, 'Tax residency country is required').max(200),
  taxIdentificationNumbers: z.string().min(5, 'Tax identification number is required').max(100),
});

export const TaxInfoStep = () => {
  const { kycData, updateTaxInfo, setCurrentStep, submitStep } = useKYC();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaxInfo>({
    resolver: zodResolver(schema),
    defaultValues: kycData.taxInfo,
  });

  const isUSPerson = watch('isUSPerson');

  const onSubmit = async (data: TaxInfo) => {
    try {
      setIsSubmitting(true);
      updateTaxInfo(data);
      await submitStep(3, data);
      toast.success('Tax information saved successfully');
      setCurrentStep(4);
    } catch (error) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg border">
          <Label className="text-base mb-3 block">
            Are you a U.S. citizen or U.S. tax resident? (FATCA) *
          </Label>
          <RadioGroup
            value={isUSPerson?.toString()}
            onValueChange={(value) => setValue('isUSPerson', value === 'true')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="us-yes" />
              <Label htmlFor="us-yes" className="font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="us-no" />
              <Label htmlFor="us-no" className="font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-2">
            This information is required under FATCA (Foreign Account Tax Compliance Act) regulations
          </p>
        </div>

        <div>
          <Label htmlFor="taxResidencyCountries">Tax Residency Country/Countries *</Label>
          <Input
            id="taxResidencyCountries"
            {...register('taxResidencyCountries')}
            placeholder="e.g., United States, United Kingdom"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            List all countries where you are considered a tax resident (separate multiple countries with commas)
          </p>
          {errors.taxResidencyCountries && (
            <p className="text-sm text-destructive mt-1">{errors.taxResidencyCountries.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="taxIdentificationNumbers">Tax Identification Number(s) (TIN) *</Label>
          <Input
            id="taxIdentificationNumbers"
            {...register('taxIdentificationNumbers')}
            placeholder="e.g., SSN, TIN, or equivalent"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Provide your Tax Identification Number for each country listed above. For multiple countries, separate with commas.
          </p>
          {errors.taxIdentificationNumbers && (
            <p className="text-sm text-destructive mt-1">{errors.taxIdentificationNumbers.message}</p>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
          <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
            Why do we need this information?
          </h4>
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Tax information is required to comply with international tax regulations including FATCA and CRS (Common Reporting Standard). 
            This ensures proper tax reporting and helps prevent tax evasion across jurisdictions.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
          size="lg"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Saving...' : 'Next Step'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
