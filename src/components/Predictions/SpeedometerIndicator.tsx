import { Card } from "@/components/ui/card";

interface SpeedometerIndicatorProps {
  signal: "strong_sell" | "sell" | "neutral" | "buy" | "strong_buy";
  confidence: number;
}

const SpeedometerIndicator = ({ signal, confidence }: SpeedometerIndicatorProps) => {
  const getRotation = () => {
    const positions = {
      strong_sell: -80,
      sell: -40,
      neutral: 0,
      buy: 40,
      strong_buy: 80,
    };
    return positions[signal];
  };

  const getColor = () => {
    const colors = {
      strong_sell: "#EF4444",
      sell: "#F97316",
      neutral: "#FCD34D",
      buy: "#34D399",
      strong_buy: "#10B981",
    };
    return colors[signal];
  };

  const getLabel = () => {
    const labels = {
      strong_sell: "Strong Sell",
      sell: "Sell",
      neutral: "Neutral",
      buy: "Buy",
      strong_buy: "Strong Buy",
    };
    return labels[signal];
  };

  return (
    <Card className="glass-strong p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Trading Signal</h2>
      
      <div className="relative w-64 h-64 mx-auto mb-6">
        {/* Speedometer arc */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="25%" stopColor="#F97316" />
              <stop offset="50%" stopColor="#FCD34D" />
              <stop offset="75%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d="M 30 170 A 80 80 0 1 1 170 170"
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Active arc */}
          <path
            d="M 30 170 A 80 80 0 1 1 170 170"
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 * (1 - confidence / 100)}
            className="transition-all duration-1000"
          />
          
          {/* Needle */}
          <g transform={`rotate(${getRotation()}, 100, 100)`} className="transition-transform duration-1000">
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="40"
              stroke={getColor()}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill={getColor()} />
          </g>
        </svg>
      </div>

      <div className="text-center space-y-4">
        <div>
          <div className="text-3xl font-bold" style={{ color: getColor() }}>
            {getLabel()}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Confidence: {confidence}%
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground px-4">
          <span>Strong Sell</span>
          <span>Neutral</span>
          <span>Strong Buy</span>
        </div>
      </div>
    </Card>
  );
};

export default SpeedometerIndicator;
