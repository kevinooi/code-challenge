const TOKEN_ICON_BASE = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export const TokenIcon = ({ symbol, className = "token-icon" }) => {
  const iconUrl = `${TOKEN_ICON_BASE}/${symbol}.svg`;
  return (
    <div className={className}>
      <img
        src={iconUrl}
        alt={symbol}
        onError={(e) => {
          e.target.src = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/USD.svg"; // Fallback
        }}
      />
    </div>
  );
};
