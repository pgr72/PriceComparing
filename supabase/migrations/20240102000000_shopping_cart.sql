-- Create shopping_carts table (one cart per user)
CREATE TABLE IF NOT EXISTS public.shopping_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT DEFAULT 'Min handlevogn',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping_cart_items table
CREATE TABLE IF NOT EXISTS public.shopping_cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES public.shopping_carts(id) ON DELETE CASCADE NOT NULL,
  good_id UUID REFERENCES public.goods(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, good_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shopping_carts_user_id ON public.shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_items_cart_id ON public.shopping_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_items_good_id ON public.shopping_cart_items(good_id);

-- Enable RLS
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart_items ENABLE ROW LEVEL SECURITY;

-- shopping_carts: owner-only access
CREATE POLICY "Users can view own cart"
  ON public.shopping_carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cart"
  ON public.shopping_carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON public.shopping_carts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON public.shopping_carts FOR DELETE
  USING (auth.uid() = user_id);

-- shopping_cart_items: access through cart ownership
CREATE POLICY "Users can view own cart items"
  ON public.shopping_cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_carts
      WHERE id = shopping_cart_items.cart_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to own cart"
  ON public.shopping_cart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_carts
      WHERE id = shopping_cart_items.cart_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cart items"
  ON public.shopping_cart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_carts
      WHERE id = shopping_cart_items.cart_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cart items"
  ON public.shopping_cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_carts
      WHERE id = shopping_cart_items.cart_id AND user_id = auth.uid()
    )
  );

-- Updated_at trigger for shopping_carts
CREATE TRIGGER set_updated_at_shopping_carts
  BEFORE UPDATE ON public.shopping_carts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RPC function: get latest price per good per store
CREATE OR REPLACE FUNCTION public.get_latest_prices_for_goods(good_ids UUID[])
RETURNS TABLE (
  good_id UUID,
  store_id UUID,
  store_name TEXT,
  store_location TEXT,
  price DECIMAL(10,2),
  currency_code TEXT,
  currency_symbol TEXT,
  date DATE
) AS $$
  SELECT DISTINCT ON (p.good_id, p.store_id)
    p.good_id,
    p.store_id,
    s.name AS store_name,
    s.location AS store_location,
    p.price,
    c.code AS currency_code,
    c.symbol AS currency_symbol,
    p.date
  FROM public.prices p
  JOIN public.stores s ON s.id = p.store_id
  JOIN public.currencies c ON c.id = p.currency_id
  WHERE p.good_id = ANY(good_ids)
  ORDER BY p.good_id, p.store_id, p.date DESC;
$$ LANGUAGE sql STABLE;
