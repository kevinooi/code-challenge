import { useState, useEffect } from "react";
import axios from "axios";

const PRICES_URL = "https://interview.switcheo.com/prices.json";
const POLLING_INTERVAL = 60000; // 1 minute

export const useTokenPrices = () => {
  const [prices, setPrices] = useState({});
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrices = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setLoading(true);
      const response = await axios.get(PRICES_URL);
      const data = response.data;
      
      // Use the latest price for each currency
      const latestPrices = {};
      data.forEach((item) => {
        // Normalizing currency to uppercase to prevent casing issues
        const currencyKey = item.currency;
        if (!latestPrices[currencyKey] || new Date(item.date) > new Date(latestPrices[currencyKey].date)) {
          latestPrices[currencyKey] = item;
        }
      });

      setPrices(latestPrices);
      setTokens(Object.keys(latestPrices).sort());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      if (isFirstLoad) setError("Could not load market data. Please try again later.");
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(true);
    const interval = setInterval(() => fetchPrices(), POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { prices, tokens, loading, error, refresh: fetchPrices };
};
