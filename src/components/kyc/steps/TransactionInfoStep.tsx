import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKYC, TransactionInfo } from '@/contexts/KYCContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from 'sonner';

const formSchema = z.object({
  incomingPaymentsMonthlyEuro: z.string().min(1, 'Monthly incoming payments amount is required'),
  incomingPaymentCountries: z.string().min(1, 'Countries receiving payments from is required'),
  incomingTransactionAmount: z.string().min(1, 'Average transaction amount is required'),
  outgoingPaymentsMonthlyEuro: z.string().min(1, 'Monthly outgoing payments amount is required'),
  outgoingPaymentCountries: z.string().min(1, 'Countries sending payments to is required'),
  outgoingTransactionAmount: z.string().min(1, 'Average transaction amount is required'),
});

export const TransactionInfoStep = () => {
  const { kybData, updateTransactionInfo, setCurrentStep, submitStep } = useKYC();

  const form = useForm<TransactionInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: kybData.transactionInfo,
  });

  const onSubmit = async (data: TransactionInfo) => {
    try {
      await submitStep(3, data);
      updateTransactionInfo(data);
      setCurrentStep(4);
      toast.success('Transaction information saved');
    } catch (error) {
      toast.error('Failed to save transaction information');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Incoming Payments</h3>
          
          <FormField
            control={form.control}
            name="incomingPaymentsMonthlyEuro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total monthly incoming payments (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 50000" {...field} />
                </FormControl>
                <FormDescription>
                  Approximate total amount you receive per month
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incomingPaymentCountries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Countries receiving payments from</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Germany, France, Netherlands" {...field} />
                </FormControl>
                <FormDescription>
                  List the main countries you receive payments from
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incomingTransactionAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Average incoming transaction amount (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 2500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Outgoing Payments</h3>
          
          <FormField
            control={form.control}
            name="outgoingPaymentsMonthlyEuro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total monthly outgoing payments (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 40000" {...field} />
                </FormControl>
                <FormDescription>
                  Approximate total amount you send per month
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outgoingPaymentCountries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Countries sending payments to</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., United Kingdom, Belgium, Spain" {...field} />
                </FormControl>
                <FormDescription>
                  List the main countries you send payments to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outgoingTransactionAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Average outgoing transaction amount (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 2000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
};
