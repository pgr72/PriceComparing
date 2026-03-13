-- Create exchange_rates table for storing historical exchange rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_currency TEXT NOT NULL,
  quote_currency TEXT NOT NULL,
  rate DECIMAL(12, 6) NOT NULL,
  rate_date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'norges_bank',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint to prevent duplicate date+currency pairs
CREATE UNIQUE INDEX idx_exchange_rates_unique
  ON public.exchange_rates (base_currency, quote_currency, rate_date);

-- Index for efficient date-range queries
CREATE INDEX idx_exchange_rates_date
  ON public.exchange_rates (rate_date DESC);

-- Enable RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Public read access (same pattern as countries, currencies, stores, goods)
CREATE POLICY "Exchange rates are viewable by everyone"
  ON public.exchange_rates FOR SELECT
  USING (true);
