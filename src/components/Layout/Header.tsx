import { Link, useLocation } from "react-router-dom";
import { TrendingUp, Bot, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
const Header = () => {
  const location = useLocation();
  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary bg-zinc-950">
            <TrendingUp className="w-6 h-6 text-background" />
          </div>
          <span className="text-xl font-bold">Sol AI
        </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link to="/predictions">
            <Button variant={location.pathname === "/predictions" ? "default" : "ghost"} className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Predictions
            </Button>
          </Link>
          <Link to="/agent">
            <Button variant={location.pathname === "/agent" ? "default" : "ghost"} className="gap-2">
              <Bot className="w-4 h-4" />
              AI Agent
            </Button>
          </Link>
          <Link to="/portfolio">
            <Button variant={location.pathname === "/portfolio" ? "default" : "ghost"} className="gap-2">
              <Briefcase className="w-4 h-4" />
              Portfolio
            </Button>
          </Link>
        </nav>
      </div>
    </header>;
};
export default Header;