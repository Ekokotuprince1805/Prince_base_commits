// ============================================
// tokens.js
// Fetch token balances for connected wallet
// ============================================

// Minimal ERC-20 ABI for balanceOf
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

/**
 * Encode a balanceOf call manually (without ethers.js)
 * Uses ABI encoding: function selector + padded address
 * @param {string} address
 * @returns {string} hex calldata
 */
function encodeBalanceOf(address) {
  // keccak256("balanceOf(address)") = 0x70a08231
  const selector = "0x70a08231";
  const paddedAddr = address.toLowerCase().replace("0x", "").padStart(64, "0");
  return selector + paddedAddr;
}

/**
 * Fetch the native ETH balance of a wallet
 * @param {string} address - Wallet address
 * @returns {Promise<string>} Balance in Wei (as hex string)
 */
async function fetchEthBalance(address) {
  if (!address) return "0";
  try {
    const result = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    return result; // hex string
  } catch (err) {
    console.error("fetchEthBalance error:", err);
    return "0";
  }
}

/**
 * Fetch ERC-20 token balance using eth_call
 * @param {string} walletAddress - User's wallet
 * @param {string} tokenAddress - ERC-20 contract address
 * @returns {Promise<string>} Balance as hex string
 */
async function fetchTokenBalance(walletAddress, tokenAddress) {
  if (!walletAddress || !tokenAddress) return "0x0";
  try {
    const callData = encodeBalanceOf(walletAddress);
    const result = await window.ethereum.request({
      method: "eth_call",
      params: [{ to: tokenAddress, data: callData }, "latest"],
    });
    return result || "0x0";
  } catch (err) {
    console.error(`fetchTokenBalance error for ${tokenAddress}:`, err);
    return "0x0";
  }
}

/**
 * Convert a hex balance string to a decimal BigInt
 * @param {string} hex
 * @returns {BigInt}
 */
function hexToBigInt(hex) {
  if (!hex || hex === "0x" || hex === "0x0") return BigInt(0);
  return BigInt(hex);
}

/**
 * Fetch all token balances (ETH + ERC-20s) for the connected wallet
 * @param {string} address - Connected wallet address
 * @returns {Promise<Array>} Array of { symbol, name, balance, raw, decimals, color, icon }
 */
async function fetchAllBalances(address) {
  if (!address) return [];

  const results = [];

  // ETH balance
  const ethHex = await fetchEthBalance(address);
  const ethRaw = hexToBigInt(ethHex).toString();
  const ethBalance = formatFromWei(ethRaw, 18, 6);
  results.push({
    symbol: "ETH",
    name: TOKEN_META.ETH.name,
    balance: ethBalance,
    raw: ethRaw,
    decimals: 18,
    color: TOKEN_META.ETH.color,
    icon: TOKEN_META.ETH.icon,
  });

  // ERC-20 tokens
  const tokens = [
    { key: "USDC", address: TOKEN_ADDRESSES.USDC },
    { key: "DAI",  address: TOKEN_ADDRESSES.DAI  },
    { key: "WETH", address: TOKEN_ADDRESSES.WETH },
  ];

  for (const token of tokens) {
    const hex = await fetchTokenBalance(address, token.address);
    const raw = hexToBigInt(hex).toString();
    const meta = TOKEN_META[token.key];
    const balance = formatFromWei(raw, meta.decimals, 4);
    results.push({
      symbol: token.key,
      name: meta.name,
      balance,
      raw,
      decimals: meta.decimals,
      color: meta.color,
      icon: meta.icon,
    });
  }

  return results;
}
