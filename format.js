// ============================================
// utils/format.js
// Number and ETH formatting helpers
// ============================================

/**
 * Format a raw Wei value (string/BigInt) to a readable ETH string
 * @param {string} wei - Raw value in Wei
 * @param {number} decimals - Token decimals (default 18 for ETH)
 * @param {number} displayDecimals - How many decimal places to show
 * @returns {string}
 */
function formatFromWei(wei, decimals = 18, displayDecimals = 4) {
  if (!wei || wei === "0") return "0.0000";
  try {
    const divisor = Math.pow(10, decimals);
    const value = Number(BigInt(wei)) / divisor;
    return value.toFixed(displayDecimals);
  } catch {
    return "0.0000";
  }
}

/**
 * Format a token balance with comma separators
 * @param {string|number} value
 * @param {number} decimals
 * @returns {string}
 */
function formatTokenBalance(value, decimals = 4) {
  if (!value) return "0.00";
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format gwei value cleanly
 * @param {number|string} gwei
 * @returns {string}
 */
function formatGwei(gwei) {
  const n = parseFloat(gwei);
  if (isNaN(n)) return "—";
  if (n < 1) return n.toFixed(3) + " Gwei";
  return n.toFixed(2) + " Gwei";
}

/**
 * Format ETH value to a short string with unit
 * @param {string} wei
 * @returns {string}
 */
function formatEthValue(wei) {
  const eth = formatFromWei(wei, 18, 6);
  const n = parseFloat(eth);
  if (n < 0.000001) return "< 0.000001 ETH";
  if (n >= 1000) return n.toFixed(2) + " ETH";
  return eth + " ETH";
}
