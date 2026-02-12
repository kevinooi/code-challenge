import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TokenIcon } from "./TokenIcon";

export const TokenSelectorModal = ({ tokens, prices, isOpen, onClose, onSelect, selectedToken }) => {
  const [search, setSearch] = useState("");
  
  const filteredTokens = useMemo(() => {
    const filtered = tokens.filter((t) => t.toLowerCase().includes(search.toLowerCase()));
    return [...filtered].sort((a, b) => {
      if (a === selectedToken) return -1;
      if (b === selectedToken) return 1;
      return 0;
    });
  }, [tokens, search, selectedToken]);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-100 p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-100 max-h-[80vh] rounded-3xl flex flex-col overflow-hidden glass"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Select a token</h3>
          <button className="bg-transparent text-[#848e9c] text-2xl" onClick={onClose}>
            &times;
          </button>
        </div>
        <input
          type="text"
          placeholder="Search name or symbol"
          className="mx-5 mb-2.5 px-4 py-3 rounded-xl bg-input-bg border border-border text-white outline-none focus:border-primary transition-colors"
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto py-2.5 scrollbar-thin scrollbar-thumb-border">
          {filteredTokens.map((token) => (
            <div
              key={token}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
                selectedToken === token ? "bg-primary/10" : ""
              }`}
              onClick={() => {
                onSelect(token);
                onClose();
              }}
            >
              <TokenIcon symbol={token} />
              <div className="flex flex-col">
                <span className="font-semibold">{token}</span>
                <span className="text-xs text-[#848e9c]">
                  ${prices[token]?.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
