// ============================================
// config/constants.js
// All app-wide constants for Base network
// ============================================

const BASE_CHAIN_ID = "0x2105"; // 8453 in hex — Base Mainnet

const BASE_RPC_URL = "https://mainnet.base.org";

const BASESCAN_API_BASE = "https://api.basescan.org/api";

// Replace with your own key from https://basescan.org/apis
const BASESCAN_API_KEY = "6QQTIJXWTVHCMNU5BETBVBGJFXAUGZZYYM";

// Basescan explorer base URL
const BASESCAN_TX_URL = "https://basescan.org/tx/";

// Token contract addresses on Base Mainnet
const TOKEN_ADDRESSES = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  DAI:  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  WETH: "0x4200000000000000000000000000000000000006",
};

// Token metadata (name, symbol, decimals, icon color)
const TOKEN_META = {
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    color: "#627eea",
    icon: "Ξ",
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    color: "#2775ca",
    icon: "$",
  },
  DAI: {
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    color: "#f5a623",
    icon: "◈",
  },
  WETH: {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    color: "#00d4ff",
    icon: "W",
  },
};

// Gas thresholds in Gwei
const GAS_LEVELS = {
  LOW:    5,
  MEDIUM: 15,
};

// How often to refresh gas (ms)
const GAS_REFRESH_INTERVAL = 15000;

// Transactions per page
const TXS_PER_PAGE = 10;

// Base Mainnet network config for wallet_addEthereumChain
const BASE_NETWORK_CONFIG = {
  chainId: BASE_CHAIN_ID,
  chainName: "Base",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [BASE_RPC_URL],
  blockExplorerUrls: ["https://basescan.org"],
};
