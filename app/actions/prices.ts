'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendPriceAlertEmail } from '@/lib/email';

export async function createPrice(formData: FormData) {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Only admins can create prices' };
  }

  const priceData = {
    good_id: formData.get('good_id') as string,
    store_id: formData.get('store_id') as string,
    price: parseFloat(formData.get('price') as string),
    currency_id: formData.get('currency_id') as string,
    date: formData.get('date') as string || new Date().toISOString().split('T')[0],
  };

  const { error, data: newPrice } = await supabase
    .from('prices')
    .insert(priceData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Check for price alerts
  if (newPrice) {
    await checkPriceAlerts(newPrice.good_id, newPrice.price, newPrice.currency_id, newPrice.store_id);
  }

  revalidatePath('/admin');
  revalidatePath('/pricelist');
  return { success: true };
}

export async function updatePrice(id: string, formData: FormData) {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Only admins can update prices' };
  }

  const priceData = {
    good_id: formData.get('good_id') as string,
    store_id: formData.get('store_id') as string,
    price: parseFloat(formData.get('price') as string),
    currency_id: formData.get('currency_id') as string,
    date: formData.get('date') as string,
  };

  const { error, data: updatedPrice } = await supabase
    .from('prices')
    .update(priceData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Check for price alerts
  if (updatedPrice) {
    await checkPriceAlerts(updatedPrice.good_id, updatedPrice.price, updatedPrice.currency_id, updatedPrice.store_id);
  }

  revalidatePath('/admin');
  revalidatePath('/pricelist');
  return { success: true };
}

export async function deletePrice(id: string) {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Only admins can delete prices' };
  }

  const { error } = await supabase.from('prices').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/pricelist');
  return { success: true };
}

export async function fetchPriceHistory(
  goodId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('prices')
    .select(`
      id,
      price,
      date,
      store:stores(name, location),
      currency:currencies(code, symbol)
    `)
    .eq('good_id', goodId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

// Helper function to check and trigger price alerts
async function checkPriceAlerts(
  goodId: string,
  currentPrice: number,
  currencyId: string,
  storeId: string
) {
  console.log('🔍 Checking price alerts...');
  
  const supabase = createAdminClient();

  console.log('Good ID:', goodId);
  console.log('Current Price:', currentPrice);
  console.log('Currency ID:', currencyId);


  // First, let's see ALL alerts for this good (no user join — user_id refs auth.users which PostgREST can't join)
  const { data: allAlerts, error: allAlertsError } = await supabase
    .from('price_alerts')
    .select(`
      *,
      good:good_id (name),
      currency:currency_id (code, symbol)
    `)
    .eq('good_id', goodId);

  console.log('📋 All alerts for this good:', allAlerts?.length || 0);
  if (allAlertsError) console.log('❌ Query error:', allAlertsError.message);

  // Now get the filtered alerts
  const { data: alerts, error: alertsError } = await supabase
    .from('price_alerts')
    .select(`
      *,
      good:good_id (name),
      currency:currency_id (code, symbol)
    `)
    .eq('good_id', goodId)
    .eq('currency_id', currencyId)
    .eq('is_active', true)
    .gte('target_price', currentPrice);

  console.log('📧 Alerts after filtering:', alerts?.length || 0);
  if (alertsError) console.log('❌ Filter query error:', alertsError.message);

  if (!alerts || alerts.length === 0) {
    console.log('❌ No alerts to trigger');
    return;
  }

  // Get store name
  const { data: store } = await supabase
    .from('stores')
    .select('name')
    .eq('id', storeId)
    .single();

  console.log('🏪 Store:', store?.name);

  // Send email alerts
  for (const alert of alerts) {
    const goodName = (alert.good as any)?.name;
    const currency = alert.currency as any;

    // Fetch user email via admin auth API (auth.users is not accessible via PostgREST joins)
    const { data: { user: alertUser } } = await supabase.auth.admin.getUserById(alert.user_id);
    const userEmail = alertUser?.email;

    console.log('📨 Attempting to send email to:', userEmail);

    if (userEmail && goodName && currency && store) {
      const result = await sendPriceAlertEmail({
        to: userEmail,
        goodName,
        currentPrice,
        targetPrice: alert.target_price,
        currency: currency.symbol,
        storeName: store.name,
      });
      console.log('✉️ Email result:', result);
    } else {
      console.log('⚠️ Missing data for email:', { userEmail, goodName, currency, store });
    }
  }
}
