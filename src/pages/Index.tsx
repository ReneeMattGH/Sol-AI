import { Link } from "react-router-dom";
import { TrendingUp, Bot, Sparkles, BarChart3, Briefcase, Zap, Shield, TrendingDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-block mb-8 animate-fade-in">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-neon">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary tracking-wide">AI AUTOMATION FOR TRADERS</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-heading font-bold mb-8 leading-[1.1] tracking-tight animate-fade-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
              AI-Powered Trading
            </span>
            <br />
            <span className="text-foreground mt-2 block">Intelligence Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-14 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in">
            Custom AI solutions that analyze markets, predict trends, and deliver real-time insights
            for smarter trading decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in">
            <Link to="/predictions">
              <Button size="lg" className="gap-2 text-base px-10 py-7 shadow-[0_0_40px_hsl(var(--primary)/0.3)]">
                <TrendingUp className="w-5 h-5" />
                Get Started
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button size="lg" variant="outline" className="gap-2 text-base px-10 py-7">
                <Briefcase className="w-5 h-5" />
                View Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <p className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">BENEFITS</p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Partner with an AI platform delivering smart, data-driven trading solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="p-8 hover:scale-[1.02] transition-all duration-500 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-500">
                <Activity className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Real-Time Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Stay ahead with accurate, real-time performance tracking and market insights powered by advanced AI.
              </p>
            </Card>

            <Card className="p-8 hover:scale-[1.02] transition-all duration-500 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_hsl(var(--success)/0.3)] transition-all duration-500">
                <TrendingUp className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">AI-Driven Growth</h3>
              <p className="text-muted-foreground leading-relaxed">
                Make smarter moves with accurate, real-time business insights and predictive analytics.
              </p>
            </Card>

            <Card className="p-8 hover:scale-[1.02] transition-all duration-500 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_hsl(var(--secondary)/0.3)] transition-all duration-500">
                <Zap className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Automation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automate repetitive tasks and focus on strategic decisions that drive your trading success.
              </p>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-12 text-center hover:scale-[1.02] transition-all duration-500">
              <div className="text-5xl md:text-6xl font-heading font-bold mb-3 bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                +20%
              </div>
              <p className="text-xl font-semibold mb-2">Automation</p>
              <p className="text-muted-foreground">Increase in trading efficiency</p>
            </Card>

            <Card className="p-12 text-center hover:scale-[1.02] transition-all duration-500">
              <div className="text-5xl md:text-6xl font-heading font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                60%
              </div>
              <p className="text-xl font-semibold mb-2">Cost Reduction</p>
              <p className="text-muted-foreground">Lower operational expenses</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <p className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">FEATURES</p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Powerful Tools for Modern Traders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade tools powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-10 group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-8 shadow-[0_0_30px_hsl(var(--primary)/0.3)] group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] transition-all duration-500">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">Portfolio Tracker</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Track all your crypto and stock investments in one place with real-time price updates
                and smart notifications.
              </p>
              <Link to="/portfolio">
                <Button variant="ghost" className="gap-2 text-primary hover:text-primary p-0">
                  Learn More →
                </Button>
              </Link>
            </Card>

            <Card className="p-10 group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-primary flex items-center justify-center mb-8 shadow-[0_0_30px_hsl(var(--success)/0.3)] group-hover:shadow-[0_0_40px_hsl(var(--success)/0.5)] transition-all duration-500">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">AI Predictions</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Upload trading charts and get instant AI-powered predictions with confidence levels
                and buy/sell indicators.
              </p>
              <Link to="/predictions">
                <Button variant="ghost" className="gap-2 text-primary hover:text-primary p-0">
                  Learn More →
                </Button>
              </Link>
            </Card>

            <Card className="p-10 group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center mb-8 shadow-[0_0_30px_hsl(var(--secondary)/0.3)] group-hover:shadow-[0_0_40px_hsl(var(--secondary)/0.5)] transition-all duration-500">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">Smart AI Agent</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Chat with an intelligent trading assistant that provides insights using real-time
                market data.
              </p>
              <Link to="/agent">
                <Button variant="ghost" className="gap-2 text-primary hover:text-primary p-0">
                  Learn More →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <Card className="p-16 text-center border-primary/20 shadow-[0_0_60px_hsl(var(--primary)/0.2)]">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to Start Trading Smarter?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of traders using AI to make better, data-driven decisions in the market.
            </p>
            <Link to="/predictions">
              <Button size="lg" className="gap-2 text-lg px-12 py-7 shadow-[0_0_40px_hsl(var(--primary)/0.4)]">
                <Sparkles className="w-5 h-5" />
                Get Started Now
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            ⚠️ <strong>Important Disclaimer:</strong> This platform is designed for educational
            and research purposes only. AI predictions and market analysis should not be considered
            as financial advice. Cryptocurrency and stock trading carry significant risks. Always
            conduct your own research, understand the risks involved, and consult with qualified
            financial professionals before making any investment decisions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
