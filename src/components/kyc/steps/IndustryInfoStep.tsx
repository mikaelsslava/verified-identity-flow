import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKYC, IndustryInfo } from '@/contexts/KYCContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { industries, type Industry } from '@/data/industries';
import { useState } from 'react';

const formSchema = z.object({
  industry: z.string().min(1, 'Industry is required'),
  subIndustry: z.string().min(1, 'Sub-industry is required'),
  goodsOrServices: z.string().min(1, 'Type of goods or services is required'),
});

export const IndustryInfoStep = () => {
  const { kybData, updateIndustryInfo, setCurrentStep, submitStep } = useKYC();
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | ''>(
    (kybData.industryInfo?.industry as Industry) || ''
  );

  const form = useForm<IndustryInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: kybData.industryInfo,
  });

  const onSubmit = async (data: IndustryInfo) => {
    try {
      await submitStep(2, data);
      updateIndustryInfo(data);
      setCurrentStep(3);
      toast.success('Industry information saved');
    } catch (error) {
      toast.error('Failed to save industry information');
    }
  };

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value as Industry);
    form.setValue('industry', value);
    form.setValue('subIndustry', '');
    form.setValue('goodsOrServices', '');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select industry</FormLabel>
              <Select onValueChange={handleIndustryChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select main industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.keys(industries).map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedIndustry && (
          <FormField
            control={form.control}
            name="subIndustry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What type of business do you run?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industries[selectedIndustry].map((subIndustry) => (
                      <SelectItem key={subIndustry} value={subIndustry}>
                        {subIndustry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="goodsOrServices"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What type of goods or services do you sell?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type of good or services" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="physical-goods">Physical goods</SelectItem>
                  <SelectItem value="digital-goods">Digital goods</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="mixed">Mixed (goods and services)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
};
