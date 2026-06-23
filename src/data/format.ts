// Active currency symbol — set once during company setup, read everywhere.
let _symbol = 'Rs';

export function setCurrencySymbol(symbol: string) {
  _symbol = (symbol || 'Rs').trim() || 'Rs';
}

export function currencySymbol(): string {
  return _symbol;
}

/** Symbol + the correct separator: "$1,234" for single-char, "Rs 1,234" for codes. */
export function currencyPrefix(): string {
  return _symbol.length <= 1 ? _symbol : `${_symbol} `;
}

export function formatCurrency(value: number, opts: { compact?: boolean; sign?: boolean } = {}): string {
  const { compact = false, sign = false } = opts;
  const plus = sign && value > 0 ? '+' : '';
  const neg = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  let body: string;
  if (compact) {
    if (abs >= 1_000_000) body = `${(abs / 1_000_000).toFixed(2)}M`;
    else if (abs >= 1_000) body = `${(abs / 1_000).toFixed(1)}K`;
    else body = abs.toFixed(0);
  } else {
    body = abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return `${plus}${neg}${currencyPrefix()}${body}`;
}

/** Billing is always in USD (the Vantage subscription), independent of the company's books currency. */
export function formatUSD(value: number, opts: { decimals?: boolean } = {}): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  })}`;
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function relativeDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function dateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
