-- Insert sample countries
INSERT INTO public.countries (name, code) VALUES
  ('United States', 'US'),
  ('United Kingdom', 'GB'),
  ('Norway', 'NO'),
  ('Germany', 'DE'),
  ('France', 'FR')
ON CONFLICT (code) DO NOTHING;

-- Insert sample currencies
INSERT INTO public.currencies (name, code, symbol) VALUES
  ('US Dollar', 'USD', '$'),
  ('British Pound', 'GBP', '£'),
  ('Norwegian Krone', 'NOK', 'kr'),
  ('Euro', 'EUR', '€')
ON CONFLICT (code) DO NOTHING;

-- Get country and currency IDs for reference
DO $$
DECLARE
  us_country_id UUID;
  usd_currency_id UUID;
  nok_currency_id UUID;
BEGIN
  SELECT id INTO us_country_id FROM public.countries WHERE code = 'US' LIMIT 1;
  SELECT id INTO usd_currency_id FROM public.currencies WHERE code = 'USD' LIMIT 1;
  SELECT id INTO nok_currency_id FROM public.currencies WHERE code = 'NOK' LIMIT 1;

  -- Insert sample stores
  INSERT INTO public.stores (name, location, country_id) VALUES
    ('Walmart', 'New York', us_country_id),
    ('Target', 'Los Angeles', us_country_id),
    ('Whole Foods', 'San Francisco', us_country_id)
  ON CONFLICT DO NOTHING;

  -- Insert sample goods
  INSERT INTO public.goods (name, description, category, unit) VALUES
    ('Organic Bananas', 'Fresh organic bananas', 'Fruits', 'kg'),
    ('Whole Milk', '1 gallon whole milk', 'Dairy', 'gallon'),
    ('Brown Eggs', 'Dozen large brown eggs', 'Dairy', 'dozen'),
    ('White Bread', 'Whole wheat bread loaf', 'Bakery', 'loaf'),
    ('Ground Beef', 'Lean ground beef', 'Meat', 'kg'),
    ('Chicken Breast', 'Boneless skinless chicken breast', 'Meat', 'kg'),
    ('Olive Oil', 'Extra virgin olive oil', 'Pantry', 'liter'),
    ('Pasta', 'Spaghetti pasta', 'Pantry', 'kg')
  ON CONFLICT DO NOTHING;
END $$;
