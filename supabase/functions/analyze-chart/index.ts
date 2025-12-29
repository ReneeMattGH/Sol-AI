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
    const { image, symbol = "bitcoin" } = await req.json();

    if (!image) {
      throw new Error("No image provided");
    }

    console.log(`Analyzing chart for ${symbol}...`);

    // Detect asset type and fetch appropriate data
    const cryptoSymbols: Record<string, string> = {
      'bitcoin': 'bitcoin', 'btc': 'bitcoin', 'ethereum': 'ethereum', 'eth': 'ethereum',
      'binancecoin': 'binancecoin', 'bnb': 'binancecoin', 'ripple': 'ripple', 'xrp': 'ripple',
      'cardano': 'cardano', 'ada': 'cardano', 'solana': 'solana', 'sol': 'solana',
      'dogecoin': 'dogecoin', 'doge': 'dogecoin', 'polkadot': 'polkadot', 'dot': 'polkadot',
      'matic-network': 'matic-network', 'matic': 'matic-network', 'polygon': 'matic-network'
    };

    const symbolLower = symbol.toLowerCase();
    const isKnownCrypto = cryptoSymbols[symbolLower];
    
    // Try to detect if it's a stock symbol (1-5 uppercase letters, not a known crypto)
    const isLikelyStock = /^[A-Z]{1,5}$/.test(symbol) && !isKnownCrypto;

    let currentPrice = 0;
    let high24h = 0;
    let low24h = 0;
    let marketCap = 0;
    let volume24h = 0;
    let assetType = "cryptocurrency";
    let additionalContext = "";

    if (isLikelyStock) {
      // Stock market data
      assetType = "stock";
      console.log(`Detected stock symbol: ${symbol}`);
      
      // Use fallback values for stocks - AI will analyze the chart directly
      currentPrice = 0; // Will be detected from chart
      additionalContext = `
Asset Type: Stock/Equity
Symbol: ${symbol.toUpperCase()}
Market: US Stock Market (NYSE/NASDAQ)

Note: Analyzing stock chart. Consider:
- Company fundamentals and earnings
- Sector performance and market indices
- Economic indicators and Fed policy
- Trading volume and liquidity
- Support/resistance levels from price history
      `.trim();
    } else {
      // Cryptocurrency data
      const cryptoId = isKnownCrypto || symbolLower;
      console.log(`Fetching crypto data for: ${cryptoId}`);
      
      try {
        const coinGeckoResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&community_data=false&developer_data=false`
        );

        if (coinGeckoResponse.ok) {
          const coinData = await coinGeckoResponse.json();
          currentPrice = coinData.market_data?.current_price?.usd || 0;
          high24h = coinData.market_data?.high_24h?.usd || 0;
          low24h = coinData.market_data?.low_24h?.usd || 0;
          marketCap = coinData.market_data?.market_cap?.usd || 0;
          volume24h = coinData.market_data?.total_volume?.usd || 0;
          
          additionalContext = `
Asset Type: Cryptocurrency
Market Cap Rank: #${coinData.market_cap_rank || 'N/A'}
ATH: $${coinData.market_data?.ath?.usd?.toLocaleString() || 'N/A'}
ATL: $${coinData.market_data?.atl?.usd?.toLocaleString() || 'N/A'}
          `.trim();
        }
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Call Lovable AI with vision capabilities
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an elite technical analyst expert in BOTH cryptocurrency AND stock market analysis.

Analyze this ${assetType} chart with comprehensive expertise:

Symbol: ${symbol.toUpperCase()}
${currentPrice > 0 ? `Current Price: $${currentPrice.toLocaleString()}` : 'Price: Extract from chart'}
${high24h > 0 ? `24h High: $${high24h.toLocaleString()}` : ''}
${low24h > 0 ? `24h Low: $${low24h.toLocaleString()}` : ''}
${marketCap > 0 ? `Market Cap: $${marketCap.toLocaleString()}` : ''}
${volume24h > 0 ? `24h Volume: $${volume24h.toLocaleString()}` : ''}
${additionalContext}

Your expertise includes:
- Crypto: All coins, DeFi, altcoins, Bitcoin, Ethereum, market cycles, on-chain metrics
- Stocks: All equities, sectors, indices (S&P 500, NASDAQ, DOW), fundamentals, earnings
- Technical Analysis: Chart patterns, indicators (RSI, MACD, MA), support/resistance, volume
- Market Psychology: Sentiment, fear/greed, institutional flows

Return ONLY a valid JSON object with this EXACT structure (no markdown, no code blocks):
{
  "symbol": "${symbol.toUpperCase()}",
  "currentPrice": ${currentPrice},
  "high24h": ${high24h},
  "low24h": ${low24h},
  "marketCap": "${marketCap.toLocaleString()}",
  "volume24h": "${volume24h.toLocaleString()}",
  "signal": "STRONG_BUY",
  "confidence": 75,
  "pattern": "Bullish Trend Continuation",
  "rsi": 58.3,
  "rsiSignal": "Neutral",
  "macd": 245.67,
  "macdSignal": "Bullish Momentum",
  "sma50": ${currentPrice * 0.98},
  "sma50Signal": "Above Average",
  "sma20": ${currentPrice * 0.99},
  "sma20Signal": "Golden Cross",
  "volumeRatio": "1.15%",
  "volumeSignal": "Normal Activity",
  "volatility": "0.42%",
  "volatilitySignal": "Low Risk",
  "prediction24h": "+2.5%",
  "prediction7d": "+5.8%",
  "prediction30d": "+12.3%",
  "support1": ${low24h * 0.98},
  "support2": ${low24h * 0.95},
  "support3": ${low24h * 0.92},
  "resistance1": ${high24h * 1.02},
  "resistance2": ${high24h * 1.05},
  "resistance3": ${high24h * 1.08},
  "analysis": "Detailed technical analysis based on chart patterns, indicators, and current market conditions. Include key observations about trend, momentum, and volume.",
  "recommendations": [
    "First actionable recommendation with specific entry/exit points",
    "Second recommendation about risk management",
    "Third recommendation about market conditions to watch",
    "Fourth recommendation about position sizing",
    "Fifth recommendation about stop-loss placement"
  ]
}

Analyze the chart image comprehensively:
1. **Asset Identification**: Confirm the asset type and symbol from the chart
2. **Technical Indicators**: RSI, MACD, moving averages, Bollinger Bands visible in the chart
3. **Chart Patterns**: Triangles, head & shoulders, flags, wedges, channels, candlestick patterns
4. **Support & Resistance**: Key price levels, trendlines, psychological levels
5. **Volume Analysis**: Volume trends, breakout confirmations, accumulation/distribution
6. **Trend Analysis**: Primary trend, secondary trends, momentum strength
7. **Price Action**: Candlestick patterns, price structure, market structure
8. **Predictions**: Based on technical confluence and pattern completion targets

For STOCKS additionally consider:
- Company sector and market conditions
- Correlation with major indices
- Earnings cycles and fundamental catalysts
- Institutional trading patterns

For CRYPTO additionally consider:
- Market cycle position (bull/bear)
- Bitcoin correlation and dominance
- On-chain metrics implications
- DeFi and ecosystem developments

Provide highly accurate, chart-specific values with detailed reasoning.`
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    console.log("AI response:", content);

    // Parse the AI response
    let prediction;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON from the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Provide fallback with real market data
      prediction = {
        symbol: symbol.toUpperCase(),
        currentPrice: currentPrice,
        high24h: high24h,
        low24h: low24h,
        marketCap: marketCap.toLocaleString(),
        volume24h: volume24h.toLocaleString(),
        signal: "NEUTRAL",
        confidence: 50,
        pattern: "Consolidation Phase",
        rsi: 50,
        rsiSignal: "Neutral",
        macd: 0,
        macdSignal: "Neutral",
        sma50: currentPrice,
        sma50Signal: "At Average",
        sma20: currentPrice,
        sma20Signal: "Neutral",
        volumeRatio: "1.0%",
        volumeSignal: "Normal Activity",
        volatility: "0.5%",
        volatilitySignal: "Medium Risk",
        prediction24h: "+0.5%",
        prediction7d: "+2.0%",
        prediction30d: "+5.0%",
        support1: low24h * 0.98,
        support2: low24h * 0.95,
        support3: low24h * 0.92,
        resistance1: high24h * 1.02,
        resistance2: high24h * 1.05,
        resistance3: high24h * 1.08,
        analysis: content || "Market analysis based on current data shows consolidation. Further monitoring recommended.",
        recommendations: [
          "Monitor key support and resistance levels",
          "Consider dollar-cost averaging for long-term positions",
          "Set stop-loss orders below key support levels",
          "Watch for volume confirmation on breakouts",
          "Diversify portfolio across multiple assets"
        ]
      };
    }

    return new Response(
      JSON.stringify(prediction),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error analyzing chart:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        signal: "NEUTRAL",
        confidence: 0,
        analysis: "Failed to analyze chart. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
