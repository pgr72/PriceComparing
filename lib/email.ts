import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface PriceAlertEmailProps {
  to: string;
  goodName: string;
  currentPrice: number;
  targetPrice: number;
  currency: string;
  storeName: string;
}

export async function sendPriceAlertEmail({
  to,
  goodName,
  currentPrice,
  targetPrice,
  currency,
  storeName,
}: PriceAlertEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@pricecompare.com',
      to: [to],
      subject: `🎉 Price Alert: ${goodName} is now ${currency}${currentPrice}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .price-box { background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
              .current-price { font-size: 32px; font-weight: bold; color: #10b981; }
              .target-price { font-size: 18px; color: #6b7280; text-decoration: line-through; }
              .discount { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Price Alert!</h1>
              </div>
              <div class="content">
                <h2>Great news! The price dropped for ${goodName}</h2>
                <div class="price-box">
                  <div class="target-price">Your target: ${currency}${targetPrice}</div>
                  <div class="current-price">${currency}${currentPrice}</div>
                  <div class="discount">
                    ${Math.round(((targetPrice - currentPrice) / targetPrice) * 100)}% below your target!
                  </div>
                  <p style="margin-top: 15px; color: #6b7280;">Available at: <strong>${storeName}</strong></p>
                </div>
                <p>This is a perfect time to buy! The price is now below your target price.</p>
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View in Dashboard</a>
                </div>
              </div>
              <div class="footer">
                <p>You're receiving this email because you set up a price alert.</p>
                <p>Manage your alerts in your dashboard settings.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

interface GoodDealEmailProps {
  to: string;
  deals: Array<{
    goodName: string;
    price: number;
    currency: string;
    storeName: string;
    discount: number;
  }>;
}

export async function sendGoodDealsEmail({ to, deals }: GoodDealEmailProps) {
  if (deals.length === 0) return { success: true };

  try {
    const dealsHtml = deals
      .map(
        (deal) => `
        <div style="background: white; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0;">${deal.goodName}</h3>
          <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #10b981;">
            ${deal.currency}${deal.price}
          </p>
          <p style="margin: 5px 0; color: #6b7280;">
            <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
              ${deal.discount}% off
            </span> at ${deal.storeName}
          </p>
        </div>
      `
      )
      .join('');

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@pricecompare.com',
      to: [to],
      subject: `🔥 ${deals.length} Great Deal${deals.length > 1 ? 's' : ''} Found!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔥 Great Deals Alert!</h1>
              </div>
              <div class="content">
                <p>We found ${deals.length} amazing deal${deals.length > 1 ? 's' : ''} for you today:</p>
                ${dealsHtml}
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View All Deals</a>
                </div>
              </div>
              <div class="footer">
                <p>You're receiving this email based on your notification preferences.</p>
                <p>Update your preferences in your dashboard settings.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
