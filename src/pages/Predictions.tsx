import { useState } from "react";
import { Upload, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import TradingChart from "@/components/Predictions/TradingChart";
import { CryptoSelector } from "@/components/Predictions/CryptoSelector";

const Predictions = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin");

  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setChartImage(imageData);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-chart`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: imageData, symbol: selectedCrypto }),
          }
        );

        const data = await response.json();
        setPrediction(data);

        toast({
          title: "Analysis Complete",
          description: "AI has analyzed your chart with real-time data.",
        });
      } catch (error) {
        console.error("Error analyzing chart:", error);
        toast({
          title: "Analysis Failed",
          description: "Failed to analyze the chart. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
    }
  };

  const getSignalColor = (signal: string) => {
    if (signal?.includes("BUY")) return "text-success";
    if (signal?.includes("SELL")) return "text-danger";
    return "text-yellow-500";
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">AI PREDICTIONS</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Technical Analysis
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload trading charts for instant AI analysis with real-time market data
          </p>
        </div>

        <Card className="p-10 mb-10 animate-fade-in">
          <div className="space-y-6">
            {chartImage ? (
              <div className="rounded-2xl overflow-hidden border-2 border-border/30 bg-black/10 backdrop-blur-sm">
                <img src={chartImage} alt="Uploaded chart" className="w-full" />
              </div>
            ) : (
              <div 
                className={`border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer ${
                  isDragging 
                    ? 'border-primary bg-primary/5 shadow-[0_0_30px_hsl(var(--primary)/0.2)]' 
                    : 'border-border/30 hover:border-primary/40 hover:bg-primary/5'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="chart-upload"
                />
                <label htmlFor="chart-upload" className="cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-foreground font-semibold text-lg mb-2">
                    {isDragging ? 'Drop your chart here' : 'Click or drag & drop chart image'}
                  </p>
                  <p className="text-muted-foreground">PNG, JPG up to 10MB</p>
                </label>
              </div>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              <CryptoSelector value={selectedCrypto} onChange={setSelectedCrypto} />
              
              <Button variant="outline" onClick={() => setChartImage(null)}>
                Change Chart
              </Button>
              
              <Button 
                onClick={() => document.getElementById("chart-upload")?.click()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Chart"}
              </Button>
            </div>
          </div>
        </Card>

        {isAnalyzing && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-6 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"></div>
            <p className="text-muted-foreground font-medium">Analyzing chart with real-time AI...</p>
          </div>
        )}

        {prediction && (
          <div className="space-y-8 animate-fade-in">
            {/* Market Data */}
            <Card className="p-8">
              <h2 className="text-2xl font-heading font-bold mb-6">Market Data</h2>
              <div className="mb-6">
                <h3 className="text-4xl font-heading font-bold text-foreground">{prediction.symbol}</h3>
                <p className="text-5xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mt-3">
                  ${prediction.currentPrice?.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 rounded-2xl bg-success/5 border border-success/20">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">24h High</p>
                  <p className="text-2xl font-bold text-success">${prediction.high24h?.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-danger/5 border border-danger/20">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">24h Low</p>
                  <p className="text-2xl font-bold text-danger">${prediction.low24h?.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">Market Cap</p>
                  <p className="text-2xl font-bold text-foreground">${prediction.marketCap}</p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">Volume 24h</p>
                  <p className="text-2xl font-bold text-foreground">${prediction.volume24h}</p>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Signal Confidence */}
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <h3 className={`text-2xl font-heading font-bold ${getSignalColor(prediction.signal)}`}>
                    {prediction.signal?.replace(/_/g, " ")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 font-semibold">Confidence Level</p>
                <div className="relative w-full h-6 bg-muted/20 rounded-full overflow-hidden border border-border/30">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_hsl(var(--success)/0.4)]"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
                <p className="text-right text-4xl font-heading font-bold text-foreground mt-4">{prediction.confidence}%</p>
              </Card>

              {/* Pattern */}
              <Card className="p-8">
                <p className="text-sm text-muted-foreground mb-4 font-semibold">Detected Pattern</p>
                <p className="text-3xl font-heading font-bold text-foreground">{prediction.pattern}</p>
              </Card>
            </div>

            {/* Technical Indicators */}
            <Card className="p-8">
              <h2 className="text-2xl font-heading font-bold mb-8">Technical Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-primary/5 to-transparent border border-border/30">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">RSI (14)</p>
                  <p className="text-3xl font-heading font-bold text-foreground mb-2">{prediction.rsi}</p>
                  <p className="text-sm text-muted-foreground">{prediction.rsiSignal}</p>
                </div>
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-primary/5 to-transparent border border-border/30">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">MACD</p>
                  <p className="text-3xl font-heading font-bold text-foreground mb-2">{prediction.macd}</p>
                  <p className="text-sm text-muted-foreground">{prediction.macdSignal}</p>
                </div>
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-primary/5 to-transparent border border-border/30">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">SMA (50)</p>
                  <p className="text-3xl font-heading font-bold text-foreground mb-2">${prediction.sma50?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{prediction.sma50Signal}</p>
                </div>
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-primary/5 to-transparent border border-border/30">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">SMA (20)</p>
                  <p className="text-3xl font-heading font-bold text-foreground mb-2">${prediction.sma20?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{prediction.sma20Signal}</p>
                </div>
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-primary/5 to-transparent border border-border/30">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">Volume/Avg</p>
                  <p className="text-3xl font-heading font-bold text-foreground mb-2">{prediction.volumeRatio}</p>
                  <p className="text-sm text-muted-foreground">{prediction.volumeSignal}</p>
                </div>
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-primary/5 to-transparent border border-border/30">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">Volatility</p>
                  <p className="text-3xl font-heading font-bold text-foreground mb-2">{prediction.volatility}</p>
                  <p className="text-sm text-muted-foreground">{prediction.volatilitySignal}</p>
                </div>
              </div>
            </Card>

            {/* Predictions, Support, Resistance */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8">
                <h3 className="text-xl font-heading font-bold mb-6">Predictions</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-muted/10">
                    <span className="text-muted-foreground font-semibold">24h</span>
                    <span className={`font-bold text-lg ${prediction.prediction24h?.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                      {prediction.prediction24h}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-muted/10">
                    <span className="text-muted-foreground font-semibold">7d</span>
                    <span className={`font-bold text-lg ${prediction.prediction7d?.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                      {prediction.prediction7d}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-muted/10">
                    <span className="text-muted-foreground font-semibold">30d</span>
                    <span className={`font-bold text-lg ${prediction.prediction30d?.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                      {prediction.prediction30d}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-heading font-bold mb-6">Support Levels</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-success/5 border border-success/20">
                    <span className="text-muted-foreground font-semibold">S1</span>
                    <span className="font-bold text-lg text-success">${prediction.support1?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-success/5 border border-success/20">
                    <span className="text-muted-foreground font-semibold">S2</span>
                    <span className="font-bold text-lg text-success">${prediction.support2?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-success/5 border border-success/20">
                    <span className="text-muted-foreground font-semibold">S3</span>
                    <span className="font-bold text-lg text-success">${prediction.support3?.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-heading font-bold mb-6">Resistance Levels</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-danger/5 border border-danger/20">
                    <span className="text-muted-foreground font-semibold">R1</span>
                    <span className="font-bold text-lg text-danger">${prediction.resistance1?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-danger/5 border border-danger/20">
                    <span className="text-muted-foreground font-semibold">R2</span>
                    <span className="font-bold text-lg text-danger">${prediction.resistance2?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-danger/5 border border-danger/20">
                    <span className="text-muted-foreground font-semibold">R3</span>
                    <span className="font-bold text-lg text-danger">${prediction.resistance3?.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Analysis */}
            <Card className="p-8">
              <h3 className="text-xl font-heading font-bold mb-6">AI Analysis</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">{prediction.analysis}</p>
            </Card>

            {/* Recommendations */}
            <Card className="p-8">
              <h3 className="text-xl font-heading font-bold mb-6">Recommendations</h3>
              <div className="space-y-4">
                {prediction.recommendations?.map((rec: string, idx: number) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-muted-foreground flex-1 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <div className="mt-16 p-8 rounded-3xl border border-border/30 backdrop-blur-2xl bg-[rgba(255,255,255,0.02)]">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            ⚠️ <strong>Disclaimer:</strong> This platform is for educational and research purposes only. 
            AI predictions should not be considered financial advice. Always conduct your own research and 
            consult with financial professionals before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
