export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

/**
 * Country / region → default currency. Matching is fuzzy (lowercased,
 * substring) so "UAE", "Dubai" or "United Arab Emirates" all resolve to AED.
 */
const COUNTRY_CURRENCY: [string[], string][] = [
  [['pakistan'], 'PKR'],
  [['india'], 'INR'],
  [['united arab emirates', 'uae', 'dubai', 'abu dhabi', 'emirates', 'sharjah'], 'AED'],
  [['saudi', 'ksa', 'riyadh', 'jeddah'], 'SAR'],
  [['bangladesh', 'dhaka'], 'BDT'],
  [['nigeria', 'lagos'], 'NGN'],
  [['south africa', 'johannesburg', 'cape town'], 'ZAR'],
  [['united kingdom', 'uk', 'britain', 'england', 'scotland', 'wales', 'london'], 'GBP'],
  [['united states', 'usa', 'america', 'u.s', 'canada', 'ecuador'], 'USD'],
  [
    ['germany', 'france', 'spain', 'italy', 'netherlands', 'ireland', 'portugal', 'belgium', 'austria', 'finland', 'greece', 'europe'],
    'EUR',
  ],
];

/** Best-guess currency code for a typed country/region, or null if unknown. */
export function currencyForCountry(country: string): string | null {
  const q = country.trim().toLowerCase();
  if (q.length < 2) return null;
  for (const [aliases, code] of COUNTRY_CURRENCY) {
    if (aliases.some((a) => q.includes(a) || a.startsWith(q))) return code;
  }
  return null;
}

export const INDUSTRIES = [
  'Retail & Trade',
  'Wholesale / Distribution',
  'Manufacturing',
  'Services & Consulting',
  'Technology / SaaS',
  'Construction',
  'Logistics',
  'Food & Beverage',
  'Healthcare',
  'Other',
];

export type PlanKey = 'starter' | 'growth' | 'scale';
export type BillingCycle = 'monthly' | 'annual';

export interface Plan {
  key: PlanKey;
  name: string;
  blurb: string;
  pricePerSeat: number; // USD per seat per month
  minSeats: number;
  features: string[];
}

// Billing is for the Vantage subscription itself — always priced in USD.
// No free tier; the cheapest seat is $10/mo.
export const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    blurb: 'Essentials to run your books',
    pricePerSeat: 10,
    minSeats: 1,
    features: ['Customer khata ledgers', 'Expense tracking', 'Dashboard & live revenue'],
  },
  {
    key: 'growth',
    name: 'Growth',
    blurb: 'Scale with partners & payroll',
    pricePerSeat: 24,
    minSeats: 3,
    features: ['Everything in Starter', 'Partner revenue split', 'Live payroll', 'Unlimited admins'],
  },
  {
    key: 'scale',
    name: 'Scale',
    blurb: 'Full control & insights',
    pricePerSeat: 49,
    minSeats: 10,
    features: ['Everything in Growth', 'Advanced reports & export', 'Priority support', 'Audit log'],
  },
];

export const ANNUAL_DISCOUNT = 0.2; // 20% off when billed yearly
export const BILLING_MIN = 10; // USD floor — never bill less than this
