import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKYC, CompanyDetails } from '@/contexts/KYCContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const formSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  tradesUnderDifferentName: z.boolean().default(false),
  tradingName: z.string().optional(),
  companyRegistrationNumber: z.string().min(1, 'Registration number is required'),
  companyRegistrationDate: z.date({ required_error: 'Registration date is required' }),
  entityType: z.string().min(1, 'Entity type is required'),
  websiteOrBusinessChannel: z.string().min(1, 'This field is required'),
});

export const CompanyDetailsStep = () => {
  const { kybData, updateCompanyDetails, setCurrentStep, submitStep } = useKYC();

  const form = useForm<CompanyDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: kybData.companyDetails,
  });

  const tradesUnderDifferentName = form.watch('tradesUnderDifferentName');

  const onSubmit = async (data: CompanyDetails) => {
    try {
      await submitStep(1, data);
      updateCompanyDetails(data);
      setCurrentStep(2);
      toast.success('Company details saved');
    } catch (error) {
      toast.error('Failed to save company details');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company name as in official registry</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tradesUnderDifferentName"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Company trades under a different name</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {tradesUnderDifferentName && (
          <FormField
            control={form.control}
            name="tradingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trading name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter trading name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="companyRegistrationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company registration number</FormLabel>
              <FormControl>
                <Input placeholder="Enter company registration number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyRegistrationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company registration date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="limited-company">Limited Company</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="sole-trader">Sole Trader</SelectItem>
                  <SelectItem value="llp">Limited Liability Partnership</SelectItem>
                  <SelectItem value="plc">Public Limited Company</SelectItem>
                  <SelectItem value="charity">Charity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteOrBusinessChannel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website or way of conducting business</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter website URL, or describe sales channels, or way of how clients are reached"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
};
