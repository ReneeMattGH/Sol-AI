import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  type: "crypto" | "stock";
}

const MarketTicker = () => {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-tickers`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        const data = await response.json();
        setTickers(data.tickers || []);
      } catch (error) {
        console.error("Error fetching tickers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickers();
    const interval = setInterval(fetchTickers, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card border-y border-border/50 py-3 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-sm text-muted-foreground">Loading market data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-neon border-x-0 py-4 overflow-hidden relative backdrop-blur-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/3 to-transparent"></div>
      <div className="animate-marquee flex gap-16 whitespace-nowrap">
        {[...tickers, ...tickers].map((ticker, index) => (
          <div key={`${ticker.symbol}-${index}`} className="flex items-center gap-4 text-sm group hover:scale-105 transition-transform">
            <span className="font-bold text-foreground text-base tracking-wide font-heading">{ticker.symbol}</span>
            <span className="text-muted-foreground font-semibold">${ticker.price.toFixed(2)}</span>
            <span
              className={`flex items-center gap-1.5 font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                ticker.change >= 0 
                  ? "text-success bg-success/10 shadow-[0_0_15px_hsl(var(--success)/0.2)]" 
                  : "text-danger bg-danger/10 shadow-[0_0_15px_hsl(var(--danger)/0.2)]"
              }`}
            >
              {ticker.change >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {ticker.change >= 0 ? "+" : ""}
              {ticker.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
