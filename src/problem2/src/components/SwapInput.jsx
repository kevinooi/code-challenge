import { ChevronDown } from "lucide-react";
import { TokenIcon } from "./TokenIcon";

export const SwapInput = ({
  label,
  amount,
  onAmountChange,
  token,
  onTokenSelectorOpen,
  balance,
  readOnly = false,
}) => {
  return (
    <div className="bg-input-bg border border-border rounded-2xl p-4 focus-within:border-primary transition-colors">
      <div className="flex justify-between mb-2 text-sm text-[#848e9c]">
        <label>{label}</label>
        {balance !== undefined && (
          <span>Balance: {balance.toFixed(2)} {token}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          placeholder="0.00"
          className="flex-1 bg-transparent border-none outline-none text-white text-2xl font-medium w-full"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          readOnly={readOnly}
          required
        />
        <button
          type="button"
          className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-xl text-white font-semibold whitespace-nowrap hover:bg-[#3e444b] transition-colors"
          onClick={onTokenSelectorOpen}
        >
          <TokenIcon symbol={token} />
          <span>{token}</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
};
