import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceData {
  symbol: string;
  currentPrice: number;
  previousPrice: number;
  changePercent: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting price monitoring check...');

    // Fetch all unique watchlist items
    const { data: watchlistItems, error: watchlistError } = await supabase
      .from('watchlist')
      .select('*');

    if (watchlistError) {
      console.error('Error fetching watchlist:', watchlistError);
      throw watchlistError;
    }

    console.log(`Monitoring ${watchlistItems?.length || 0} watchlist items`);

    // Get current prices for crypto
    const cryptoSymbols = watchlistItems
      ?.filter(item => item.asset_type === 'crypto')
      .map(item => item.symbol) || [];

    const cryptoPrices: Record<string, PriceData> = {};
    if (cryptoSymbols.length > 0) {
      try {
        const cryptoResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbols.join(',')}&vs_currencies=usd&include_24hr_change=true`
        );
        const cryptoData = await cryptoResponse.json() as Record<string, { usd: number; usd_24h_change?: number }>;
        
        for (const [symbol, data] of Object.entries(cryptoData)) {
          cryptoPrices[symbol] = {
            symbol,
            currentPrice: data.usd,
            previousPrice: data.usd / (1 + ((data.usd_24h_change || 0) / 100)),
            changePercent: data.usd_24h_change || 0,
          };
        }
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    }

    // Check each watchlist item for significant changes
    const notifications = [];
    
    for (const item of watchlistItems || []) {
      const priceData = cryptoPrices[item.symbol];
      if (!priceData) continue;

      const changePercent = Math.abs(priceData.changePercent);
      const threshold = item.alert_threshold || 2.0;

      if (changePercent >= threshold) {
        const isPositive = priceData.changePercent >= 0;
        notifications.push({
          userId: item.user_id,
          symbol: item.symbol.toUpperCase(),
          name: item.name,
          price: priceData.currentPrice,
          change: priceData.changePercent,
          isPositive,
          message: `${isPositive ? '🚀' : '📉'} ${item.name} ${isPositive ? 'is up' : 'dropped'} ${Math.abs(priceData.changePercent).toFixed(1)}%! Now $${priceData.currentPrice.toLocaleString()}`
        });
      }
    }

    console.log(`Generated ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        monitored: watchlistItems?.length || 0,
        notifications: notifications.length,
        alerts: notifications 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in price-monitor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
