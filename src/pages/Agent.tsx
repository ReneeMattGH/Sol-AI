import { useState } from "react";
import { Send, Bot, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formatMarkdown = (text: string) => {
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold mt-3 mb-2 text-foreground">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-4 mb-3 text-foreground">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-card/50 p-3 rounded-lg my-2 overflow-x-auto border border-border/20 text-sm"><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-medium">$1</code>')
    .replace(/^\• (.*$)/gim, '<li class="ml-4 my-1 text-sm">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 my-1 text-sm">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 my-1 text-sm">$1</li>')
    .replace(/\n\n/g, '</p><p class="my-2 text-sm leading-relaxed">')
    .replace(/\n/g, '<br/>');
  
  html = html.replace(/(<li.*?<\/li>(\s*<li.*?<\/li>)*)/g, '<ul class="list-disc my-2 space-y-1">$1</ul>');
  
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<pre')) {
    html = `<p class="text-sm leading-relaxed">${html}</p>`;
  }
  
  return html;
};

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const Agent = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI trading analyst. Ask me about any crypto or stock, or upload a chart for technical analysis."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messageText?: string, imageData?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() && !imageData) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      imageUrl: imageData
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading-agent`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            image: imageData
          })
        }
      );

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response
      }]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const imageData = event.target?.result as string;
      sendMessage("Analyze this trading chart", imageData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">AI ASSISTANT</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Trading Agent
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent assistant for market analysis and trading insights
          </p>
        </div>

        <Card className="p-8 mb-8 animate-fade-in" style={{ height: "550px", overflowY: "auto" }}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-5 py-4 max-w-[85%] ${
                    message.role === "user"
                      ? "bg-primary/10 border border-primary/30 text-foreground"
                      : "backdrop-blur-xl border border-border/40 bg-[rgba(255,255,255,0.02)]"
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Uploaded chart"
                      className="rounded-lg mb-3 max-w-full border border-border/20"
                    />
                  )}
                  {message.role === "assistant" ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                      className="text-foreground/90 [&_strong]:text-foreground [&_code]:text-primary"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="backdrop-blur-2xl border border-border/30 rounded-3xl px-6 py-5 bg-[rgba(255,255,255,0.03)]">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-100"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 animate-fade-in">
          <div className="flex gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="agent-image-upload"
            />
            <label htmlFor="agent-image-upload">
              <Button variant="outline" size="icon" className="flex-shrink-0 w-12 h-12" asChild>
                <div>
                  <Upload className="w-5 h-5" />
                </div>
              </Button>
            </label>
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask me anything about trading, crypto, or stocks..."
              className="min-h-[70px] resize-none backdrop-blur-xl border-border/30 text-base"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="flex-shrink-0 w-12 h-12"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Agent;
