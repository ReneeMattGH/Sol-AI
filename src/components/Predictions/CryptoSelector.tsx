import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const cryptoList = [
  { value: "bitcoin", label: "Bitcoin (BTC)" },
  { value: "ethereum", label: "Ethereum (ETH)" },
  { value: "tether", label: "Tether (USDT)" },
  { value: "binancecoin", label: "BNB (BNB)" },
  { value: "ripple", label: "Ripple (XRP)" },
  { value: "solana", label: "Solana (SOL)" },
  { value: "usd-coin", label: "USD Coin (USDC)" },
  { value: "cardano", label: "Cardano (ADA)" },
  { value: "dogecoin", label: "Dogecoin (DOGE)" },
  { value: "tron", label: "TRON (TRX)" },
  { value: "avalanche-2", label: "Avalanche (AVAX)" },
  { value: "shiba-inu", label: "Shiba Inu (SHIB)" },
  { value: "polkadot", label: "Polkadot (DOT)" },
  { value: "chainlink", label: "Chainlink (LINK)" },
  { value: "litecoin", label: "Litecoin (LTC)" },
  { value: "matic-network", label: "Polygon (MATIC)" },
  { value: "uniswap", label: "Uniswap (UNI)" },
  { value: "stellar", label: "Stellar (XLM)" },
  { value: "cosmos", label: "Cosmos (ATOM)" },
  { value: "monero", label: "Monero (XMR)" },
  { value: "ethereum-classic", label: "Ethereum Classic (ETC)" },
  { value: "filecoin", label: "Filecoin (FIL)" },
  { value: "aptos", label: "Aptos (APT)" },
  { value: "algorand", label: "Algorand (ALGO)" },
  { value: "vechain", label: "VeChain (VET)" },
  { value: "internet-computer", label: "Internet Computer (ICP)" },
  { value: "the-graph", label: "The Graph (GRT)" },
  { value: "eos", label: "EOS (EOS)" },
  { value: "aave", label: "Aave (AAVE)" },
  { value: "theta-token", label: "Theta Network (THETA)" },
  { value: "flow", label: "Flow (FLOW)" },
  { value: "sandbox", label: "The Sandbox (SAND)" },
  { value: "axie-infinity", label: "Axie Infinity (AXS)" },
  { value: "decentraland", label: "Decentraland (MANA)" },
  { value: "tezos", label: "Tezos (XTZ)" },
  { value: "elrond-erd-2", label: "MultiversX (EGLD)" },
  { value: "helium", label: "Helium (HNT)" },
  { value: "fantom", label: "Fantom (FTM)" },
  { value: "neo", label: "Neo (NEO)" },
  { value: "zcash", label: "Zcash (ZEC)" },
  { value: "dash", label: "Dash (DASH)" },
  { value: "maker", label: "Maker (MKR)" },
  { value: "compound-ether", label: "Compound (COMP)" },
  { value: "pancakeswap-token", label: "PancakeSwap (CAKE)" },
  { value: "sushi", label: "SushiSwap (SUSHI)" },
  { value: "curve-dao-token", label: "Curve DAO Token (CRV)" },
  { value: "basic-attention-token", label: "Basic Attention Token (BAT)" },
  { value: "enjincoin", label: "Enjin Coin (ENJ)" },
  { value: "1inch", label: "1inch (1INCH)" },
  { value: "gala", label: "Gala (GALA)" },
];

interface CryptoSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CryptoSelector({ value, onChange }: CryptoSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between bg-background/80"
        >
          {value
            ? cryptoList.find((crypto) => crypto.value === value)?.label
            : "Select cryptocurrency..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 bg-popover/95 backdrop-blur-xl border-border z-50">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search crypto..." className="h-9" />
          <CommandEmpty>No cryptocurrency found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {cryptoList.map((crypto) => (
              <CommandItem
                key={crypto.value}
                value={crypto.value}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
                className="hover:bg-accent/10 cursor-pointer"
              >
                {crypto.label}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === crypto.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
