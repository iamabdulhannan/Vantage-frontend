/**
 * Country list for the setup dropdown. Each entry carries the default
 * currency so picking a country silently selects the right currency.
 * Currencies outside the supported list fall back to USD.
 */
export interface Country {
  name: string;
  flag: string;
  currency: string; // ISO code, mapped to CURRENCIES when supported
}

export const COUNTRIES: Country[] = [
  { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR' },
  { name: 'India', flag: '🇮🇳', currency: 'INR' },
  { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
  { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
  { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT' },
  { name: 'United States', flag: '🇺🇸', currency: 'USD' },
  { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { name: 'Afghanistan', flag: '🇦🇫', currency: 'USD' },
  { name: 'Australia', flag: '🇦🇺', currency: 'USD' },
  { name: 'Austria', flag: '🇦🇹', currency: 'EUR' },
  { name: 'Bahrain', flag: '🇧🇭', currency: 'USD' },
  { name: 'Belgium', flag: '🇧🇪', currency: 'EUR' },
  { name: 'Brazil', flag: '🇧🇷', currency: 'USD' },
  { name: 'Canada', flag: '🇨🇦', currency: 'USD' },
  { name: 'China', flag: '🇨🇳', currency: 'USD' },
  { name: 'Egypt', flag: '🇪🇬', currency: 'USD' },
  { name: 'France', flag: '🇫🇷', currency: 'EUR' },
  { name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
  { name: 'Greece', flag: '🇬🇷', currency: 'EUR' },
  { name: 'Indonesia', flag: '🇮🇩', currency: 'USD' },
  { name: 'Iran', flag: '🇮🇷', currency: 'USD' },
  { name: 'Iraq', flag: '🇮🇶', currency: 'USD' },
  { name: 'Ireland', flag: '🇮🇪', currency: 'EUR' },
  { name: 'Italy', flag: '🇮🇹', currency: 'EUR' },
  { name: 'Japan', flag: '🇯🇵', currency: 'USD' },
  { name: 'Jordan', flag: '🇯🇴', currency: 'USD' },
  { name: 'Kenya', flag: '🇰🇪', currency: 'USD' },
  { name: 'Kuwait', flag: '🇰🇼', currency: 'USD' },
  { name: 'Malaysia', flag: '🇲🇾', currency: 'USD' },
  { name: 'Maldives', flag: '🇲🇻', currency: 'USD' },
  { name: 'Mexico', flag: '🇲🇽', currency: 'USD' },
  { name: 'Morocco', flag: '🇲🇦', currency: 'USD' },
  { name: 'Nepal', flag: '🇳🇵', currency: 'INR' },
  { name: 'Netherlands', flag: '🇳🇱', currency: 'EUR' },
  { name: 'New Zealand', flag: '🇳🇿', currency: 'USD' },
  { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { name: 'Norway', flag: '🇳🇴', currency: 'EUR' },
  { name: 'Oman', flag: '🇴🇲', currency: 'USD' },
  { name: 'Philippines', flag: '🇵🇭', currency: 'USD' },
  { name: 'Poland', flag: '🇵🇱', currency: 'EUR' },
  { name: 'Portugal', flag: '🇵🇹', currency: 'EUR' },
  { name: 'Qatar', flag: '🇶🇦', currency: 'USD' },
  { name: 'Russia', flag: '🇷🇺', currency: 'USD' },
  { name: 'Singapore', flag: '🇸🇬', currency: 'USD' },
  { name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' },
  { name: 'South Korea', flag: '🇰🇷', currency: 'USD' },
  { name: 'Spain', flag: '🇪🇸', currency: 'EUR' },
  { name: 'Sri Lanka', flag: '🇱🇰', currency: 'USD' },
  { name: 'Sweden', flag: '🇸🇪', currency: 'EUR' },
  { name: 'Switzerland', flag: '🇨🇭', currency: 'EUR' },
  { name: 'Thailand', flag: '🇹🇭', currency: 'USD' },
  { name: 'Turkey', flag: '🇹🇷', currency: 'USD' },
  { name: 'Ukraine', flag: '🇺🇦', currency: 'EUR' },
  { name: 'Vietnam', flag: '🇻🇳', currency: 'USD' },
  { name: 'Yemen', flag: '🇾🇪', currency: 'USD' },
  { name: 'Other', flag: '🌐', currency: 'USD' },
];

/** Common owner roles for the setup dropdown. */
export const OWNER_ROLES = [
  'Founder & CEO',
  'Co-Founder',
  'Owner',
  'Director',
  'General Manager',
  'Manager',
  'Accountant',
  'Partner',
];
