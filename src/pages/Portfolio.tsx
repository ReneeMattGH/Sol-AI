import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Search, TrendingUp, TrendingDown, Bell, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface Asset {
  id?: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h?: number;
  price_change_percentage?: number;
  image?: string;
  market_cap?: number;
  total_volume?: number;
  volume?: number;
}
interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  alert_threshold: number;
}
const Portfolio = () => {
  const [user, setUser] = useState<any>(null);
  const [cryptoData, setCryptoData] = useState<Asset[]>([]);
  const [stockData, setStockData] = useState<Asset[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [cryptoSearch, setCryptoSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    checkUser();
    requestNotificationPermission();
  }, []);
  useEffect(() => {
    if (user) {
      fetchData();
      fetchWatchlist();

      // Set up real-time updates for watchlist
      const channel = supabase.channel('watchlist-changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'watchlist'
      }, () => {
        fetchWatchlist();
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  const checkUser = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
  };
  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Request notification permission
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You'll receive alerts for price changes ±2% or more"
          });

          // Start monitoring prices
          startPriceMonitoring();
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
        toast({
          title: "Setup Failed",
          description: "Could not enable notifications",
          variant: "destructive"
        });
      }
    }
  };
  const startPriceMonitoring = () => {
    // Check prices every 2 minutes
    const monitorInterval = setInterval(async () => {
      if (!notificationsEnabled) return;
      try {
        const response = await supabase.functions.invoke('price-monitor');
        const data = response.data;
        if (data?.alerts && data.alerts.length > 0) {
          // Show browser notifications
          for (const alert of data.alerts) {
            if (Notification.permission === 'granted') {
              new Notification(`${alert.symbol} Price Alert`, {
                body: alert.message,
                icon: '/placeholder.svg',
                badge: '/placeholder.svg',
                tag: alert.symbol
              });
            }
          }
        }
      } catch (error) {
        console.error('Error monitoring prices:', error);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(monitorInterval);
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const [cryptoResponse, stockResponse] = await Promise.all([supabase.functions.invoke('get-crypto-prices'), supabase.functions.invoke('get-stock-prices')]);
      if (cryptoResponse.data?.data) {
        setCryptoData(cryptoResponse.data.data);
      }
      if (stockResponse.data?.data) {
        setStockData(stockResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchWatchlist = async () => {
    const {
      data,
      error
    } = await supabase.from('watchlist').select('*');
    if (error) {
      console.error('Error fetching watchlist:', error);
      return;
    }
    setWatchlist(data || []);
  };
  const addToWatchlist = async (asset: Asset, type: 'crypto' | 'stock') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your watchlist",
        variant: "destructive"
      });
      return;
    }
    const {
      error
    } = await supabase.from('watchlist').insert({
      user_id: user.id,
      asset_type: type,
      symbol: asset.symbol,
      name: asset.name,
      alert_threshold: 5.0
    });
    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Already in Watchlist",
          description: "This item is already in your watchlist"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to watchlist",
          variant: "destructive"
        });
      }
      return;
    }
    toast({
      title: "Added to Watchlist",
      description: `${asset.name} has been added to your watchlist`
    });
  };
  const removeFromWatchlist = async (id: string) => {
    const {
      error
    } = await supabase.from('watchlist').delete().eq('id', id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Removed",
      description: "Item removed from watchlist"
    });
  };
  const getWatchlistAssets = () => {
    return watchlist.map(item => {
      const asset = item.asset_type === 'crypto' ? cryptoData.find(c => c.symbol === item.symbol) : stockData.find(s => s.symbol === item.symbol);
      return asset ? {
        ...item,
        ...asset
      } : null;
    }).filter(Boolean);
  };
  const filteredCrypto = cryptoData.filter(crypto => crypto.name.toLowerCase().includes(cryptoSearch.toLowerCase()) || crypto.symbol.toLowerCase().includes(cryptoSearch.toLowerCase()));
  const filteredStocks = stockData.filter(stock => stock.name.toLowerCase().includes(stockSearch.toLowerCase()) || stock.symbol.toLowerCase().includes(stockSearch.toLowerCase()));
  const calculateTotalValue = () => {
    const assets = getWatchlistAssets();
    return assets.reduce((sum, asset: any) => sum + (asset?.current_price || 0), 0);
  };
  const AssetCard = ({
    asset,
    type,
    onAdd,
    isInWatchlist = false,
    onRemove
  }: any) => {
    const priceChange = asset.price_change_percentage_24h || asset.price_change_percentage || 0;
    const isPositive = priceChange >= 0;
    return <Card className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {asset.image && <div className="relative">
                  <img src={asset.image} alt={asset.name} className="w-12 h-12 rounded-full ring-2 ring-border/50 group-hover:ring-primary/50 transition-all" />
                  {isPositive && <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                      <TrendingUp size={10} className="text-black" />
                    </div>}
                </div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-lg truncate">{asset.name}</h3>
                <p className="text-sm text-muted-foreground font-medium">{asset.symbol.toUpperCase()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground text-xl">${asset.current_price?.toLocaleString()}</p>
              <div className={`flex items-center gap-1.5 text-sm font-bold px-2 py-1 rounded-full mt-1 ${isPositive ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositive ? '+' : ''}{Math.abs(priceChange).toFixed(2)}%
              </div>
            </div>
            {isInWatchlist ? <Button size="icon" variant="ghost" onClick={() => onRemove(asset.id)} className="hover:bg-danger/10 hover:text-danger">
                <Star className="fill-primary text-primary" size={22} />
              </Button> : <Button size="icon" variant="ghost" onClick={() => onAdd(asset, type)} className="hover:bg-primary/10 hover:text-primary">
                <Star size={22} />
              </Button>}
          </div>
        </CardContent>
      </Card>;
  };
  return <div className="container mx-auto p-6 space-y-8">
      {/* Summary Bar */}
      <Card className="glass-neon relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10"></div>
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h2 className="text-xl font-bold text-muted-foreground mb-2">Total Portfolio Value</h2>
              <p className="text-5xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-white">
                ${calculateTotalValue().toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{watchlist.length} assets tracked</p>
            </div>
            <Button variant={notificationsEnabled ? "success" : "neon"} size="lg" onClick={() => setNotificationsEnabled(!notificationsEnabled)} className="gap-3">
              {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              <span className="font-semibold">
                {notificationsEnabled ? 'Alerts Active' : 'Enable Alerts'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="watchlist" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass p-1 h-auto">
          <TabsTrigger value="watchlist" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.3)] rounded-lg py-3 font-semibold transition-all">
            <Star className="mr-2 h-4 w-4" />
            Watchlist ({watchlist.length})
          </TabsTrigger>
          <TabsTrigger value="crypto" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.3)] rounded-lg py-3 font-semibold transition-all">
            🪙 Crypto Coins
          </TabsTrigger>
          <TabsTrigger value="stocks" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.3)] rounded-lg py-3 font-semibold transition-all">
            📈 Stocks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="space-y-4 mt-6">
          <Card className="glass-neon">
            <CardHeader>
              <CardTitle className="text-2xl">Your Watchlist</CardTitle>
              <CardDescription className="text-base">
                Track your favorite crypto and stocks in one place with real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : getWatchlistAssets().length === 0 ? <p className="text-center text-muted-foreground py-8">
                  Your watchlist is empty. Add some crypto or stocks to get started!
                </p> : getWatchlistAssets().map((asset: any) => <AssetCard key={asset.id} asset={asset} type={asset.asset_type} isInWatchlist={true} onRemove={removeFromWatchlist} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4 mt-6">
          <Card className="glass-neon">
            <CardHeader>
              <CardTitle className="text-2xl">Cryptocurrency Market</CardTitle>
              <CardDescription className="text-base">
                Browse and track top cryptocurrencies with live price data
              </CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search crypto by name or symbol..." value={cryptoSearch} onChange={e => setCryptoSearch(e.target.value)} className="pl-12 h-12 glass text-base" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : filteredCrypto.map(crypto => <AssetCard key={crypto.symbol} asset={crypto} type="crypto" onAdd={addToWatchlist} isInWatchlist={watchlist.some(w => w.symbol === crypto.symbol && w.asset_type === 'crypto')} onRemove={(id: string) => {
              const item = watchlist.find(w => w.symbol === crypto.symbol && w.asset_type === 'crypto');
              if (item) removeFromWatchlist(item.id);
            }} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stocks" className="space-y-4 mt-6">
          <Card className="glass-neon">
            <CardHeader>
              <CardTitle className="text-2xl">Stock Market</CardTitle>
              <CardDescription className="text-base">
                Browse major global and Indian stocks with real-time tracking
              </CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search stocks by name or symbol..." value={stockSearch} onChange={e => setStockSearch(e.target.value)} className="pl-12 h-12 glass text-base" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : filteredStocks.map(stock => <AssetCard key={stock.symbol} asset={stock} type="stock" onAdd={addToWatchlist} isInWatchlist={watchlist.some(w => w.symbol === stock.symbol && w.asset_type === 'stock')} onRemove={(id: string) => {
              const item = watchlist.find(w => w.symbol === stock.symbol && w.asset_type === 'stock');
              if (item) removeFromWatchlist(item.id);
            }} />)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Portfolio;