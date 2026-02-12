interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  priority: number;
  formatted: string;
}

interface Props extends BoxProps {}

// Helper function moved outside component to prevent recreation
// Changed 'any' to 'string' for type safety
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case "Osmosis":
      return 100;
    case "Ethereum":
      return 50;
    case "Arbitrum":
      return 30;
    case "Zilliqa":
      return 20;
    case "Neo":
      return 20;
    default:
      return -99;
  }
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo(() => {
    // Priority and formatted are computed here
    return (
      balances
        .map((balance: WalletBalance) => {
          return {
            ...balance,
            priority: getPriority(balance.blockchain),
            formatted: balance.amount.toFixed()
          } as FormattedWalletBalance;
        })
        // Filter out balances with negative or zero amount
        .filter((balance: FormattedWalletBalance) => {
          return balance.priority > -99 && balance.amount > 0;
        })
        .sort((lhs: FormattedWalletBalance, rhs: FormattedWalletBalance) => {
          // Simplified logic to sort numbers in descending order.
          return rhs.priority - lhs.priority;
        })
    );
  }, [balances]);

  // Memoized rows, ensuring rows are only re-calculated when dependencies actually change.
  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => {
      // Fallback to 0 for undefined price
      const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={balance.currency} // Used currency as key instead of index
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [formattedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};
