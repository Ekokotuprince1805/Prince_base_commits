// ============================================
// app.js
// Main application entry point
// Wires together all modules
// ============================================

// ---- Show / Hide Sections ----

function showDashboard() {
  document.getElementById("heroSection").classList.add("hidden");
  document.getElementById("dashboardSection").classList.remove("hidden");
}

function showHero() {
  document.getElementById("heroSection").classList.remove("hidden");
  document.getElementById("dashboardSection").classList.add("hidden");
}

// ---- Initialize Dashboard ----

/**
 * Load all dashboard data for a connected address
 * @param {string} address
 */
async function initDashboard(address) {
  showDashboard();
  updateNavbarConnected(address);

  // Network check
  const onBase = await isOnBaseNetwork();
  if (!onBase) {
    showNetworkWarning();
  } else {
    hideNetworkWarning();
  }

  // Wallet card
  const ethHex = await fetchEthBalance(address);
  const ethRaw = parseInt(ethHex, 16).toString();
  const ethFormatted = formatFromWei(ethRaw, 18, 4);
  renderWalletCard(address, ethFormatted);

  // Tokens
  showTokenListLoading();
  const tokens = await fetchAllBalances(address);
  hideTokenListLoading();
  renderTokenList(tokens);

  // Transactions
  showTxListLoading();
  const txs = await fetchTransactions(address);
  hideTxListLoading();
  filterTransactions("all", address);
  renderTxList(getTransactionPage(1), address);

  // Gas
  startGasRefresh((gwei, level, trend, history) => {
    renderGasCard(gwei, level, trend, history);
  });
}

// ---- Gas Card Renderer ----

function renderGasCard(gwei, level, trend, history) {
  const main    = document.getElementById("gasMain");
  const badge   = document.getElementById("gasLevelBadge");
  const trendEl = document.getElementById("gasTrend");
  const histEl  = document.getElementById("gasHistoryRow");

  if (main)    main.textContent = gwei.toFixed(2) + " Gwei";
  if (badge) {
    badge.textContent = level.toUpperCase();
    badge.className = `gas-level-badge ${level}`;
  }
  if (trendEl) trendEl.textContent = trend;

  // Draw mini bar chart from history
  if (histEl && history.length > 0) {
    const max = Math.max(...history, 1);
    histEl.innerHTML = history.map((val) => {
      const pct = Math.max(10, Math.round((val / max) * 100));
      return `<div class="gas-bar" style="height:${pct}%"></div>`;
    }).join("");
  }
}

// ---- Clear Dashboard ----

function clearDashboard() {
  stopGasRefresh();
  resetTransactions();
  clearWalletCard();
  renderTokenList([]);
  renderTxList([], "");
  updateNavbarDisconnected();
  hideNetworkWarning();
  showHero();
}

// ---- Callbacks from wallet.js ----

function onWalletDisconnected() {
  clearDashboard();
  showToast("Wallet disconnected.");
}

function onAccountChanged(newAddress) {
  resetTransactions();
  initDashboard(newAddress);
  showToast("Account switched.");
}

// ---- Dark Mode ----

function toggleDarkMode() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem("baseboard-theme", isLight ? "light" : "dark");
}

function loadSavedTheme() {
  const saved = localStorage.getItem("baseboard-theme");
  if (saved === "light") {
    document.body.classList.add("light-mode");
  }
}

// ---- Copy Address ----

async function copyAddress() {
  if (!currentAccount) return;
  try {
    await navigator.clipboard.writeText(currentAccount);
    showToast("Address copied!");
  } catch {
    showToast("Could not copy address.");
  }
}

// ---- Event Listeners Setup ----

function bindEvents() {
  // Connect buttons
  document.getElementById("connectBtn")?.addEventListener("click", handleConnect);
  document.getElementById("heroConnectBtn")?.addEventListener("click", handleConnect);

  // Disconnect
  document.getElementById("disconnectBtn")?.addEventListener("click", () => {
    disconnectWallet();
    clearDashboard();
  });

  // Copy address
  document.getElementById("copyAddressBtn")?.addEventListener("click", copyAddress);

  // Dark mode toggle
  document.getElementById("darkModeToggle")?.addEventListener("click", toggleDarkMode);

  // Refresh balances
  document.getElementById("refreshBalancesBtn")?.addEventListener("click", async () => {
    if (!currentAccount) return;
    showToast("Refreshing balances...");
    showTokenListLoading();
    const tokens = await fetchAllBalances(currentAccount);
    hideTokenListLoading();
    renderTokenList(tokens);
    const ethHex = await fetchEthBalance(currentAccount);
    const ethRaw = parseInt(ethHex, 16).toString();
    updateEthBalanceDisplay(formatFromWei(ethRaw, 18, 4));
  });

  // Switch network
  document.getElementById("switchNetworkBtn")?.addEventListener("click", async () => {
    await switchToBaseNetwork();
  });

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      filterTransactions(filter, currentAccount);
      renderTxList(getTransactionPage(1), currentAccount);
    });
  });

  // Pagination
  document.getElementById("nextPage")?.addEventListener("click", () => {
    const txs = nextPage();
    renderTxList(txs, currentAccount);
  });
  document.getElementById("prevPage")?.addEventListener("click", () => {
    const txs = prevPage();
    renderTxList(txs, currentAccount);
  });
}

// ---- Handle Connect ----

async function handleConnect() {
  const address = await connectWallet();
  if (address) {
    await initDashboard(address);
  }
}

// ---- App Boot ----

async function boot() {
  loadSavedTheme();
  initFooter();
  bindEvents();
  listenForAccountChanges();
  listenForChainChanges();

  // Try auto-reconnect
  const saved = await getConnectedAccount();
  if (saved) {
    await initDashboard(saved);
  }
}

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", boot);
                       
