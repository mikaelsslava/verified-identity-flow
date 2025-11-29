import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { countries } from '@/data/countries';

interface CountryMultiSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CountryMultiSelect = ({ value, onChange, placeholder = "Select countries" }: CountryMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const selectedCountries = value ? value.split(',').filter(Boolean) : [];
  
  const toggleCountry = (countryLabel: string) => {
    const newSelected = selectedCountries.includes(countryLabel)
      ? selectedCountries.filter(c => c !== countryLabel)
      : [...selectedCountries, countryLabel];
    onChange(newSelected.join(','));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {selectedCountries.length > 0 
              ? `${selectedCountries.length} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search countries..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  onSelect={() => toggleCountry(country.label)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCountries.includes(country.label)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {country.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map((country) => (
            <Badge key={country} variant="secondary" className="gap-1">
              {country}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleCountry(country)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
