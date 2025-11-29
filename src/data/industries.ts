export const industries = {
  "Agriculture, Farming and Forestry": [
    "Agricultural raw materials",
    "Animals, Fishing and aquaculture",
    "Crops or grains, vegetables",
    "Farming",
    "Forestry"
  ],
  "Arts, Entertainment and Recreation": [
    "Creative arts",
    "Entertainment",
    "Gambling",
    "Museums and heritage",
    "Sports and recreation"
  ],
  "Construction": [
    "Building construction",
    "Civil engineering",
    "Specialized construction"
  ],
  "Education": [
    "Higher education",
    "Primary and secondary education",
    "Technical and vocational training"
  ],
  "Financial Services": [
    "Banking",
    "Insurance",
    "Investment",
    "Payment services"
  ],
  "Healthcare": [
    "Hospitals",
    "Medical practices",
    "Pharmaceutical",
    "Social care"
  ],
  "Hospitality": [
    "Accommodation",
    "Food and beverage",
    "Tourism"
  ],
  "Manufacturing": [
    "Chemical products",
    "Electronics",
    "Food and beverage",
    "Machinery",
    "Textiles"
  ],
  "Professional Services": [
    "Accounting",
    "Consulting",
    "Legal services",
    "Marketing and advertising"
  ],
  "Real Estate": [
    "Property development",
    "Property management",
    "Real estate agency"
  ],
  "Retail Trade": [
    "E-commerce",
    "Food and beverage retail",
    "General merchandise",
    "Specialized retail"
  ],
  "Technology": [
    "IT services",
    "Software development",
    "Telecommunications"
  ],
  "Transportation and Logistics": [
    "Freight transport",
    "Passenger transport",
    "Postal and courier",
    "Warehousing"
  ],
  "Wholesale Trade": [
    "Agricultural products",
    "Consumer goods",
    "Industrial goods"
  ]
} as const;

export type Industry = keyof typeof industries;
export type SubIndustry = typeof industries[Industry][number];
