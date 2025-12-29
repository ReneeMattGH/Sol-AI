import { useEffect, useRef } from "react";
import { createChart, IChartApi, LineSeries } from "lightweight-charts";
import { Card } from "@/components/ui/card";

interface TradingChartProps {
  prediction: any;
}

const TradingChart = ({ prediction }: TradingChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#D1D4DC",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#a855f7",
      lineWidth: 2,
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = lineSeries;

    // Sample data - in production, this would come from the API
    const data = [
      { time: "2024-01-01", value: 100 },
      { time: "2024-01-02", value: 105 },
      { time: "2024-01-03", value: 112 },
      { time: "2024-01-04", value: 108 },
      { time: "2024-01-05", value: 115 },
      { time: "2024-01-06", value: 122 },
    ];

    lineSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (prediction && candlestickSeriesRef.current) {
      // Update chart with prediction data
      console.log("Updating chart with prediction:", prediction);
    }
  }, [prediction]);

  return (
    <Card className="glass-strong p-6">
      <h2 className="text-2xl font-bold mb-6">Live Chart with Predictions</h2>
      <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden" />
      {prediction && (
        <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">AI Analysis</h3>
          <p className="text-sm text-foreground">{prediction.analysis}</p>
        </div>
      )}
    </Card>
  );
};

export default TradingChart;
