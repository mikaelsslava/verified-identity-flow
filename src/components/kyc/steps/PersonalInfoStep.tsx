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
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useKYC, PersonalInfo } from '@/contexts/KYCContext';
import { toast } from 'sonner';
import { useState } from 'react';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  placeOfBirth: z.string().min(2, 'Place of birth is required').max(100),
  nationality: z.string().min(2, 'Nationality is required'),
  additionalCitizenships: z.string(),
  residentialAddress: z.string().min(10, 'Complete address is required').max(200),
  lengthOfResidence: z.string().min(1, 'Length of residence is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required').max(20),
});

export const PersonalInfoStep = () => {
  const { kycData, updatePersonalInfo, setCurrentStep, submitStep } = useKYC();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(schema),
    defaultValues: kycData.personalInfo,
  });

  const dateOfBirth = watch('dateOfBirth');
  const nationality = watch('nationality');

  const onSubmit = async (data: PersonalInfo) => {
    try {
      setIsSubmitting(true);
      updatePersonalInfo(data);
      await submitStep(1, data);
      toast.success('Personal information saved successfully');
      setCurrentStep(2);
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
          <Label htmlFor="fullName">Full Legal Name *</Label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="Enter your full legal name"
            className="mt-1.5"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-1.5',
                    !dateOfBirth && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={(date) => setValue('dateOfBirth', date)}
                  disabled={(date) =>
                    date > new Date() || date < new Date('1900-01-01')
                  }
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.dateOfBirth && (
              <p className="text-sm text-destructive mt-1">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="placeOfBirth">Place of Birth *</Label>
            <Input
              id="placeOfBirth"
              {...register('placeOfBirth')}
              placeholder="City, Country"
              className="mt-1.5"
            />
            {errors.placeOfBirth && (
              <p className="text-sm text-destructive mt-1">{errors.placeOfBirth.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nationality">Nationality / Citizenship *</Label>
            <Select
              value={nationality}
              onValueChange={(value) => setValue('nationality', value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.nationality && (
              <p className="text-sm text-destructive mt-1">{errors.nationality.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="additionalCitizenships">Additional Citizenships</Label>
            <Input
              id="additionalCitizenships"
              {...register('additionalCitizenships')}
              placeholder="If applicable"
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="residentialAddress">Residential Address *</Label>
          <Input
            id="residentialAddress"
            {...register('residentialAddress')}
            placeholder="Street, City, State, ZIP, Country"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter your complete residential address
          </p>
          {errors.residentialAddress && (
            <p className="text-sm text-destructive mt-1">{errors.residentialAddress.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lengthOfResidence">Length of Residence (years) *</Label>
          <Input
            id="lengthOfResidence"
            type="number"
            {...register('lengthOfResidence')}
            placeholder="5"
            className="mt-1.5"
          />
          {errors.lengthOfResidence && (
            <p className="text-sm text-destructive mt-1">{errors.lengthOfResidence.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              {...register('contactEmail')}
              placeholder="your.email@example.com"
              className="mt-1.5"
            />
            {errors.contactEmail && (
              <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contactPhone">Contact Phone Number *</Label>
            <Input
              id="contactPhone"
              type="tel"
              {...register('contactPhone')}
              placeholder="+1 (555) 000-0000"
              className="mt-1.5"
            />
            {errors.contactPhone && (
              <p className="text-sm text-destructive mt-1">{errors.contactPhone.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Saving...' : 'Next Step'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
