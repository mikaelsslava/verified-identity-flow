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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useKYC, Identification } from '@/contexts/KYCContext';
import { toast } from 'sonner';
import { useState } from 'react';

const schema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  documentNumber: z.string().min(5, 'Document number is required').max(50),
  issuingCountry: z.string().min(2, 'Issuing country is required'),
  expiryDate: z.date({ required_error: 'Expiry date is required' }),
  documentFile: z.any().refine((val) => val !== null, 'Document upload is required'),
});

export const IdentificationStep = () => {
  const { kycData, updateIdentification, setCurrentStep, submitStep } = useKYC();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Identification>({
    resolver: zodResolver(schema),
    defaultValues: kycData.identification,
  });

  const documentType = watch('documentType');
  const expiryDate = watch('expiryDate');
  const documentFile = watch('documentFile');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setValue('documentFile', file);
      setFileName(file.name);
    }
  };

  const onSubmit = async (data: Identification) => {
    try {
      setIsSubmitting(true);
      updateIdentification(data);
      
      // In a real app, you'd upload the file separately
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      });

      await submitStep(2, data);
      toast.success('Identification information saved successfully');
      setCurrentStep(3);
    } catch (error) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="documentType">Type of Identification Document *</Label>
          <Select
            value={documentType}
            onValueChange={(value) => setValue('documentType', value)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="national-id">National ID Card</SelectItem>
              <SelectItem value="drivers-license">Driver's License</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a government-issued identification document
          </p>
          {errors.documentType && (
            <p className="text-sm text-destructive mt-1">{errors.documentType.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="documentNumber">Document Number *</Label>
            <Input
              id="documentNumber"
              {...register('documentNumber')}
              placeholder="Enter document number"
              className="mt-1.5"
            />
            {errors.documentNumber && (
              <p className="text-sm text-destructive mt-1">{errors.documentNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="issuingCountry">Issuing Country / Authority *</Label>
            <Input
              id="issuingCountry"
              {...register('issuingCountry')}
              placeholder="e.g., United States"
              className="mt-1.5"
            />
            {errors.issuingCountry && (
              <p className="text-sm text-destructive mt-1">{errors.issuingCountry.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="expiryDate">Expiry Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal mt-1.5',
                  !expiryDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiryDate ? format(expiryDate, 'PPP') : 'Select expiry date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiryDate}
                onSelect={(date) => setValue('expiryDate', date)}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {errors.expiryDate && (
            <p className="text-sm text-destructive mt-1">{errors.expiryDate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="documentFile">Upload Copy of Identification Document *</Label>
          <div className="mt-1.5">
            <label
              htmlFor="documentFile"
              className="flex items-center justify-center w-full h-32 px-4 transition border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 border-border bg-muted/50"
            >
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {fileName ? (
                    <span className="font-medium text-foreground">{fileName}</span>
                  ) : (
                    <>
                      <span className="font-medium text-primary">Click to upload</span> or drag and
                      drop
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, PNG, or JPG (max 10MB)
                </p>
              </div>
              <input
                id="documentFile"
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a clear, legible copy of your identification document
          </p>
          {errors.documentFile && (
            <p className="text-sm text-destructive mt-1">{errors.documentFile.message as string}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
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
