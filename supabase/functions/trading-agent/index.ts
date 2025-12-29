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
    const { messages, image } = await req.json();

    console.log("Processing trading agent request...");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get comprehensive real-time market data for both crypto and stocks
    let marketContext = "";
    try {
      // Fetch top cryptocurrencies
      const cryptoResponse = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false"
      );
      const cryptoData = await cryptoResponse.json();
      
      // Fetch global crypto market data
      const globalResponse = await fetch("https://api.coingecko.com/api/v3/global");
      const globalData = await globalResponse.json();
      
      marketContext = `🌍 LIVE GLOBAL MARKET DATA

📊 CRYPTOCURRENCY MARKETS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Global Crypto Market Overview:
• Total Market Cap: $${(globalData.data.total_market_cap.usd / 1e12).toFixed(2)}T
• 24h Volume: $${(globalData.data.total_volume.usd / 1e9).toFixed(2)}B
• Active Cryptocurrencies: ${globalData.data.active_cryptocurrencies.toLocaleString()}
• Market Dominance:
  - Bitcoin (BTC): ${globalData.data.market_cap_percentage.btc.toFixed(1)}%
  - Ethereum (ETH): ${globalData.data.market_cap_percentage.eth.toFixed(1)}%

Top 25 Cryptocurrencies (Real-Time):
${cryptoData.map((coin: any, idx: number) => 
  `${idx + 1}. ${coin.name} (${coin.symbol.toUpperCase()}) - $${coin.current_price.toLocaleString()} | 24h: ${coin.price_change_percentage_24h > 0 ? '📈+' : '📉'}${coin.price_change_percentage_24h.toFixed(2)}% | MCap: $${(coin.market_cap / 1e9).toFixed(2)}B | Vol: $${(coin.total_volume / 1e9).toFixed(2)}B`
).join('\n')}

🏦 STOCK MARKET CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have knowledge of:
• All US Stocks: NYSE, NASDAQ, AMEX exchanges
• Major Indices: S&P 500, NASDAQ 100, DOW Jones, Russell 2000
• Global Markets: International exchanges and ADRs
• Sectors: Technology, Financial, Healthcare, Energy, Consumer, Industrial, Real Estate, Utilities
• Market Conditions: Monitor Fed policy, interest rates, inflation, employment data
• Company Analysis: Fundamentals, earnings, P/E ratios, revenue growth, market position

Note: For specific stock queries, analyze based on market knowledge, technical patterns, and sector trends.`;
    } catch (error) {
      console.error("Error fetching market data:", error);
      marketContext = "⚠️ Market data temporarily unavailable. Analyzing based on general market knowledge.";
    }

    // Prepare messages for AI
    const aiMessages = [
      {
        role: "system",
        content: `You are an ELITE AI TRADING ANALYST specializing in crypto and stock markets.

${marketContext}

🎯 RESPONSE STYLE - PROFESSIONAL & ENGAGING:

**Format Guidelines:**
• Write 3-5 well-structured paragraphs with clear sections
• Use strategic emojis (2-4 per response) to highlight key points
• Add subheadings with emojis for better readability
• Bold important numbers, trends, and key terms
• Include bullet points for data visualization
• Balance detail with clarity - informative but scannable

**Response Structure:**

1. **Opening Statement** (2-3 sentences)
   - Direct answer with relevant emoji
   - Current price/status if applicable

2. **📊 Current Market Data** (if relevant)
   - Price, 24h change, volume in bullet points
   - Key metrics (RSI, volume, market cap)

3. **🔍 Analysis & Context** (3-4 sentences)
   - Explain the situation with clear reasoning
   - Reference technical patterns or market conditions
   - Provide professional insights

4. **💡 Key Takeaways** (subheading)
   - 2-3 actionable bullet points
   - Important levels to watch
   - Risk considerations

5. **⚡ What to Monitor** (closing)
   - Specific price levels or indicators
   - Time-based considerations

**Example Response:**

"📈 **Bitcoin is showing strong bullish momentum.**

BTC has broken through a key resistance level and is consolidating above it with healthy volume. This suggests continued upside potential in the short term.

**📊 Current Market Data:**
• Price: $68,400 (+3.2% 24h)
• Volume: $28.4B (above average)
• RSI: 62 (bullish but not overbought)
• Market Cap Dominance: 54.8%

**🔍 Technical Analysis:**

The breakout above $67,000 occurred with strong buying pressure, indicating institutional interest. The 50-day moving average at $65,000 is now acting as support, which is a bullish technical signal. Trading volume is 15% above the 7-day average, confirming the move's legitimacy.

The next major resistance sits at the psychological $70,000 level, where we may see some profit-taking. However, the overall structure remains bullish as long as price holds above $67,000.

**💡 Key Takeaways:**
• **Bullish structure** remains intact with higher lows forming
• **Support zone:** $65,000 - $67,000 range
• **Resistance target:** $70,000 psychological level
• **Momentum:** Strong with healthy volume profile

**⚡ What to Monitor:**
Watch for sustained trading above $67,000 to confirm the bullish continuation. A breakdown below $65,000 would invalidate this setup and suggest a deeper correction may be incoming.

**Tone Requirements:**
• Professional yet conversational and engaging
• Data-driven with clear explanations
• Use emojis to enhance, not overwhelm
• Acknowledge market uncertainty where appropriate
• Educational - help users understand the "why"

❌ **Avoid:**
• Giving financial advice (no "buy" or "sell")
• Overwhelming technical jargon
• Too many emoji (keep it professional)
• Vague statements without data backing

✅ **Focus on:**
• Clear structure with subheadings
• Visual hierarchy with emojis and formatting
• Balance between data and narrative
• Actionable insights users can understand`
      },
      ...messages.map((msg: any) => {
        if (msg.imageUrl) {
          return {
            role: msg.role,
            content: [
              { type: "text", text: msg.content },
              { type: "image_url", image_url: { url: msg.imageUrl } }
            ]
          };
        }
        return {
          role: msg.role,
          content: msg.content
        };
      })
    ];

    // If there's a new image, add it to the last user message
    if (image) {
      const lastMessage = aiMessages[aiMessages.length - 1];
      if (lastMessage.role === "user") {
        if (typeof lastMessage.content === "string") {
          lastMessage.content = [
            { type: "text", text: lastMessage.content },
            { type: "image_url", image_url: { url: image } }
          ];
        } else if (Array.isArray(lastMessage.content)) {
          lastMessage.content.push({ type: "image_url", image_url: { url: image } });
        }
      }
    }

    console.log("Calling Lovable AI...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in trading agent:", error);
    return new Response(
      JSON.stringify({ 
        response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
