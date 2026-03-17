// ============================================
// gas.js
// Fetch and track Base network gas prices
// ============================================

// Internal state
let gasHistory = [];
let gasRefreshTimer = null;

/**
 * Fetch current gas price from the connected provider
 * @returns {Promise<number>} Gas price in Gwei
 */
async function fetchGasPrice() {
  if (!isMetaMaskInstalled()) {
    // Fallback: fetch from public Base RPC
    return fetchGasFromRpc();
  }

  // Check network before fetching
  const onBase = await isOnBaseNetwork();
  if (!onBase) return null;

  try {
    const gasPriceHex = await window.ethereum.request({
      method: "eth_gasPrice",
    });
    const weiValue = parseInt(gasPriceHex, 16);
    const gwei = weiValue / 1e9;
    return parseFloat(gwei.toFixed(4));
  } catch (err) {
    console.error("fetchGasPrice error:", err);
    return null;
  }
}

/**
 * Fetch gas price from Base public RPC (no wallet needed)
 * @returns {Promise<number|null>}
 */
async function fetchGasFromRpc() {
  try {
    const res = await fetch(BASE_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        params: [],
        id: 1,
      }),
    });
    const data = await res.json();
    const weiValue = parseInt(data.result, 16);
    return parseFloat((weiValue / 1e9).toFixed(4));
  } catch {
    return null;
  }
}

/**
 * Classify gas price into Low / Medium / High
 * @param {number} gwei
 * @returns {"low"|"medium"|"high"}
 */
function getGasLevel(gwei) {
  if (gwei <= GAS_LEVELS.LOW)    return "low";
  if (gwei <= GAS_LEVELS.MEDIUM) return "medium";
  return "high";
}

/**
 * Get human-readable trend from gas history
 * @returns {string}
 */
function getGasTrend() {
  if (gasHistory.length < 2) return "Collecting data...";
  const latest = gasHistory[gasHistory.length - 1];
  const prev   = gasHistory[gasHistory.length - 2];
  const diff = latest - prev;
  if (Math.abs(diff) < 0.1) return "⟷ Stable";
  if (diff > 0) return `↑ Rising (+${diff.toFixed(2)} Gwei)`;
  return `↓ Dropping (${diff.toFixed(2)} Gwei)`;
}

/**
 * Add a reading to gas history (keeps last 5)
 * @param {number} gwei
 */
function recordGasReading(gwei) {
  gasHistory.push(gwei);
  if (gasHistory.length > 5) {
    gasHistory.shift();
  }
}

/**
 * Get current gas history array
 * @returns {number[]}
 */
function getGasHistory() {
  return [...gasHistory];
}

/**
 * Start the auto-refresh timer for gas
 * Calls a callback on each refresh
 * @param {function} onRefresh - Called with (gwei, level, trend, history)
 */
function startGasRefresh(onRefresh) {
  // Immediate first fetch
  _doGasRefresh(onRefresh);

  // Then repeat on interval
  gasRefreshTimer = setInterval(() => {
    _doGasRefresh(onRefresh);
  }, GAS_REFRESH_INTERVAL);
}

/**
 * Stop the gas refresh timer
 */
function stopGasRefresh() {
  if (gasRefreshTimer) {
    clearInterval(gasRefreshTimer);
    gasRefreshTimer = null;
  }
}

/**
 * Internal: run one refresh cycle
 * @param {function} onRefresh
 */
async function _doGasRefresh(onRefresh) {
  const gwei = await fetchGasPrice();
  if (gwei === null) return;

  recordGasReading(gwei);
  const level   = getGasLevel(gwei);
  const trend   = getGasTrend();
  const history = getGasHistory();

  if (typeof onRefresh === "function") {
    onRefresh(gwei, level, trend, history);
  }
}
