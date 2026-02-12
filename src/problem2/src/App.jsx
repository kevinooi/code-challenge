import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTokenPrices } from "./hooks/useTokenPrices";
import { TokenSelectorModal } from "./components/TokenSelectorModal";
import { SwapInput } from "./components/SwapInput";

function App() {
  const { prices, tokens, loading, error: marketError } = useTokenPrices();
  const [error, setError] = useState(null);

  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  // Track which field the user is manually editing to handle bidirectional sync correctly
  const [lastEdited, setLastEdited] = useState("from"); // "from" | "to"

  const [isSwapping, setIsSwapping] = useState(false);
  const [swapStatus, setSwapStatus] = useState(null); // null | "success"

  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);

  const fromPrice = useMemo(() => prices[fromToken]?.price || 0, [prices, fromToken]);
  const toPrice = useMemo(() => prices[toToken]?.price || 0, [prices, toToken]);

  const exchangeRate = useMemo(() => {
    if (fromPrice === 0 || toPrice === 0) return 0;
    return fromPrice / toPrice;
  }, [fromPrice, toPrice]);

  // Sync amounts whenever tokens, prices, or exchangeRate changes
  useEffect(() => {
    if (lastEdited === "from") {
      if (fromAmount === "" || isNaN(parseFloat(fromAmount))) {
        setToAmount("");
      } else {
        const calculated = parseFloat(fromAmount) * exchangeRate;
        setToAmount(calculated.toFixed(6));
      }
    } else {
      if (toAmount === "" || isNaN(parseFloat(toAmount))) {
        setFromAmount("");
      } else if (exchangeRate > 0) {
        const calculated = parseFloat(toAmount) / exchangeRate;
        setFromAmount(calculated.toFixed(6));
      }
    }
  }, [fromToken, toToken, exchangeRate, lastEdited]);

  const handleFromAmountChange = (val) => {
    setLastEdited("from");
    setFromAmount(val);
    if (val === "" || isNaN(parseFloat(val))) {
      setToAmount("");
      return;
    }
    setToAmount((parseFloat(val) * exchangeRate).toFixed(6));
  };

  const handleToAmountChange = (val) => {
    setLastEdited("to");
    setToAmount(val);
    if (val === "" || isNaN(parseFloat(val))) {
      setFromAmount("");
      return;
    }
    if (exchangeRate > 0) {
      setFromAmount((parseFloat(val) / exchangeRate).toFixed(6));
    }
  };

  const switchTokens = () => {
    const prevFromToken = fromToken;
    const prevToToken = toToken;

    setFromToken(prevToToken);
    setToToken(prevFromToken);

    const prevFromAmount = fromAmount;
    const prevToAmount = toAmount;
    setFromAmount(prevToAmount);
    setToAmount(prevFromAmount);

    // Maintain the sync direction based on the current logical state
    setLastEdited(lastEdited === "from" ? "to" : "from");
  };

  const handleSwap = async (e) => {
    e.preventDefault();
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;

    if (parseFloat(fromAmount) > 10) {
      setError("Insufficient balance. You only have 10.00 " + fromToken);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSwapping(true);
    setSwapStatus(null);
    setError(null);

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.1) reject(new Error("Transaction failed on chain"));
          else resolve();
        }, 2000);
      });

      setIsSwapping(false);
      setSwapStatus("success");
      setFromAmount("");
      setToAmount("");

      setTimeout(() => {
        setSwapStatus(null);
      }, 2000);
    } catch (err) {
      setIsSwapping(false);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-[#848e9c]">Fetching market data...</p>
      </div>
    );
  }

  if (marketError && tokens.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle size={48} className="text-error" />
        <p>{marketError}</p>
        <button
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold mt-2.5 hover:bg-primary-hover transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-120 p-5">
      <motion.div
        className="w-full p-6 rounded-3xl mb-5 glass"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Swap</h2>
          <div className="text-xs text-[#848e9c] bg-[#1e2329] px-2 py-1 rounded-md">Live Prices</div>
        </div>

        <form onSubmit={handleSwap}>
          <AnimatePresence>
            {error && (
              <motion.div
                className="flex items-center gap-2 bg-error/10 text-error p-3 rounded-xl mb-4 text-sm border border-error/20"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <SwapInput
            label="Amount to send"
            amount={fromAmount}
            onAmountChange={handleFromAmountChange}
            token={fromToken}
            onTokenSelectorOpen={() => setShowFromSelector(true)}
            balance={10}
          />

          <div className="flex justify-center -my-3 relative z-2">
            <button
              type="button"
              className="bg-input-bg border-4 border-[#0b0e11] text-primary w-10 h-10 rounded-xl flex items-center justify-center hover:bg-border transition-all hover:rotate-180 shadow-lg"
              onClick={switchTokens}
            >
              <ArrowDownUp size={20} />
            </button>
          </div>

          <SwapInput
            label="Amount to receive"
            amount={toAmount}
            onAmountChange={handleToAmountChange}
            token={toToken}
            onTokenSelectorOpen={() => setShowToSelector(true)}
          />

          {/* Exchange rate info */}
          {exchangeRate > 0 && (
            <motion.div
              className="mx-1 mt-4 p-3 rounded-xl bg-white/5 border border-white/5 space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between text-xs text-[#848e9c]">
                <span>Exchange Rate</span>
                <span className="text-white font-medium">
                  1 {fromToken} = {exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toToken}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-[#848e9c]/60">
                <span>
                  1 {fromToken} ≈ ${fromPrice.toFixed(2)}
                </span>
                <span>
                  1 {toToken} ≈ ${toPrice.toFixed(2)}
                </span>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            className={`w-full p-4 rounded-2xl text-white text-lg font-semibold mt-6 flex items-center justify-center gap-2.5 transition-all enabled:hover:-translate-y-0.5 enabled:hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed ${
              swapStatus === "success"
                ? "bg-success"
                : isSwapping
                  ? "bg-primary/70"
                  : "bg-primary enabled:hover:bg-primary-hover enabled:shadow-[0_4px_12px_rgba(93,92,222,0.3)]"
            }`}
            disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
          >
            {isSwapping ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Swapping...</span>
              </>
            ) : swapStatus === "success" ? (
              <>
                <CheckCircle2 size={20} />
                <span>Swap Successful!</span>
              </>
            ) : (
              "CONFIRM SWAP"
            )}
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {showFromSelector && (
          <TokenSelectorModal
            tokens={tokens}
            prices={prices}
            isOpen={showFromSelector}
            onClose={() => setShowFromSelector(false)}
            onSelect={setFromToken}
            selectedToken={fromToken}
          />
        )}
        {showToSelector && (
          <TokenSelectorModal
            tokens={tokens}
            prices={prices}
            isOpen={showToSelector}
            onClose={() => setShowToSelector(false)}
            onSelect={setToToken}
            selectedToken={toToken}
          />
        )}
      </AnimatePresence>

      <div className="text-center text-[11px] text-[#848e9c] opacity-70">
        <p>Market data polls every 60 seconds • Secure swap enabled</p>
      </div>
    </div>
  );
}

export default App;
