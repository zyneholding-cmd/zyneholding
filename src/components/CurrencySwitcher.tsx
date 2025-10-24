import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

interface CurrencySwitcherProps {
  onCurrencyChange: (currency: Currency) => void;
}

export const CurrencySwitcher = ({ onCurrencyChange }: CurrencySwitcherProps) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

  useEffect(() => {
    fetchCurrencies();
    loadSavedCurrency();
  }, []);

  const fetchCurrencies = async () => {
    const { data, error } = await supabase.from("currencies").select("*");
    if (data && !error) {
      setCurrencies(data);
    }
  };

  const loadSavedCurrency = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "currency")
      .single();
    if (data) {
      setSelectedCurrency(data.value);
    }
  };

  const handleCurrencyChange = async (code: string) => {
    setSelectedCurrency(code);
    const currency = currencies.find((c) => c.code === code);
    if (currency) {
      onCurrencyChange(currency);
      await supabase
        .from("app_settings")
        .upsert({ key: "currency", value: code });
    }
  };

  return (
    <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.symbol} {currency.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
