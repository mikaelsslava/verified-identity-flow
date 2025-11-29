import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CalendarIcon, ArrowRight, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useKYC, PersonalInfo } from '@/contexts/KYCContext';
import { toast } from 'sonner';
import { useState } from 'react';
import { countries } from '@/data/countries';

const schema = z.object({
  firstName: z.string().min(2, 'First name is required').max(50),
  lastName: z.string().min(2, 'Last name is required').max(50),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  placeOfBirth: z.string().min(2, 'Place of birth is required').max(100),
  nationality: z.string().min(2, 'Nationality is required'),
  additionalCitizenships: z.string(),
  addressLine1: z.string().min(2, 'Address line 1 is required').max(100),
  addressLine2: z.string(),
  city: z.string().min(2, 'City is required').max(50),
  state: z.string(),
  postalCode: z.string().min(2, 'Postal code is required').max(20),
  country: z.string().min(2, 'Country is required'),
  lengthOfResidence: z.string().min(1, 'Length of residence is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required').max(20),
});

export const PersonalInfoStep = () => {
  const { kycData, updatePersonalInfo, setCurrentStep, submitStep } = useKYC();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

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
  const country = watch('country');

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="Enter your first name"
              className="mt-1.5"
            />
            {errors.firstName && (
              <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Enter your last name"
              className="mt-1.5"
            />
            {errors.lastName && (
              <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
            )}
          </div>
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
            <Popover open={nationalityOpen} onOpenChange={setNationalityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={nationalityOpen}
                  className="w-full justify-between mt-1.5"
                >
                  {nationality
                    ? countries.find((country) => country.value === nationality)?.label
                    : "Select nationality..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countries.map((country) => (
                        <CommandItem
                          key={country.value}
                          value={country.label}
                          onSelect={() => {
                            setValue('nationality', country.value);
                            setNationalityOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              nationality === country.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {country.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Residential Address</h3>
          
          <div>
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              {...register('addressLine1')}
              placeholder="Street address"
              className="mt-1.5"
            />
            {errors.addressLine1 && (
              <p className="text-sm text-destructive mt-1">{errors.addressLine1.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              {...register('addressLine2')}
              placeholder="Apartment, suite, etc. (optional)"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="City"
                className="mt-1.5"
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State / Province</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="State or province"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                placeholder="ZIP / Postal code"
                className="mt-1.5"
              />
              {errors.postalCode && (
                <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full justify-between mt-1.5"
                  >
                    {country
                      ? countries.find((c) => c.value === country)?.label
                      : "Select country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map((c) => (
                          <CommandItem
                            key={c.value}
                            value={c.label}
                            onSelect={() => {
                              setValue('country', c.value);
                              setCountryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                country === c.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {c.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.country && (
                <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
              )}
            </div>
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
