import { PLANS, PlanKey, BillingCycle, ANNUAL_DISCOUNT, BILLING_MIN } from './currencies';

export interface BillingBreakdown {
  planKey: PlanKey;
  planName: string;
  cycle: BillingCycle;
  seats: number;
  monthlyPerSeat: number; // USD
  annualPerSeat: number; // USD (already discounted)
  monthlyTotal: number; // seats billed monthly
  annualTotal: number; // seats billed yearly
  effectiveMonthly: number; // what it works out to per month
  dueNow: number; // charged at the start of this cycle
  annualSavings: number; // saved vs paying monthly for a year
}

/** Real-time billing math. Pure function — call it anywhere the inputs change. */
export function computeBilling(planKey: PlanKey, seatsInput: number, cycle: BillingCycle): BillingBreakdown {
  const plan = PLANS.find((p) => p.key === planKey) ?? PLANS[0];
  const seats = Math.max(seatsInput, plan.minSeats);

  const monthlyPerSeat = plan.pricePerSeat;
  // Annual: pay for 12 months minus the discount, expressed per seat.
  const annualPerSeat = Math.round(monthlyPerSeat * 12 * (1 - ANNUAL_DISCOUNT));

  const monthlyTotal = Math.max(seats * monthlyPerSeat, BILLING_MIN);
  const annualTotal = Math.max(seats * annualPerSeat, BILLING_MIN);

  const dueNow = cycle === 'annual' ? annualTotal : monthlyTotal;
  const effectiveMonthly = cycle === 'annual' ? annualTotal / 12 : monthlyTotal;
  const annualSavings = seats * monthlyPerSeat * 12 - annualTotal;

  return {
    planKey: plan.key,
    planName: plan.name,
    cycle,
    seats,
    monthlyPerSeat,
    annualPerSeat,
    monthlyTotal,
    annualTotal,
    effectiveMonthly,
    dueNow,
    annualSavings,
  };
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

/** Next renewal date from a given start. */
export function nextRenewal(from: Date, cycle: BillingCycle): Date {
  return cycle === 'annual' ? addMonths(from, 12) : addMonths(from, 1);
}
