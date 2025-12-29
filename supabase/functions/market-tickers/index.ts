import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching market tickers...");

    // Fetch top cryptocurrencies from CoinGecko
    const cryptoResponse = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
    );
    const cryptoData = await cryptoResponse.json();

    // Fetch top stocks (using a simulated endpoint for demonstration)
    // In production, use Alpha Vantage, IEX Cloud, or Yahoo Finance
    const stockSymbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM", "V", "WMT"];
    
    // Mock stock data for demonstration
    const stockData = stockSymbols.map((symbol, index) => ({
      symbol,
      name: symbol,
      price: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
    }));

    const tickers = [
      ...cryptoData.slice(0, 10).map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_percentage_24h,
        type: "crypto",
      })),
      ...stockData.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        type: "stock",
      })),
    ];

    console.log(`Fetched ${tickers.length} tickers successfully`);

    return new Response(
      JSON.stringify({ tickers }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching tickers:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, tickers: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
