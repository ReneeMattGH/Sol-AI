import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TrendingUp, Bot, Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
const ScrollHeader = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/95 backdrop-blur-2xl border-b border-border/50 shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] group-hover:scale-110">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold font-heading">
            Sol <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link to="/predictions">
            <Button variant={location.pathname === "/predictions" ? "neon" : "ghost"} className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Predictions
            </Button>
          </Link>
          <Link to="/agent">
            <Button variant={location.pathname === "/agent" ? "neon" : "ghost"} className="gap-2">
              <Bot className="w-4 h-4" />
              AI Agent
            </Button>
          </Link>
          <Link to="/portfolio">
            <Button variant={location.pathname === "/portfolio" ? "neon" : "ghost"} className="gap-2">
              <Briefcase className="w-4 h-4" />
              Portfolio
            </Button>
          </Link>
        </nav>

        <Link to="/predictions">
          <Button size="default" className="gap-2">
            Get Started
          </Button>
        </Link>
      </div>
    </header>;
};
export default ScrollHeader;