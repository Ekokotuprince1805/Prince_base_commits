// ============================================
// wallet.js
// MetaMask wallet connection & management
// ============================================

// State
let currentAccount = null;

// ---- MetaMask Detection ----

/**
 * Check if MetaMask (or any injected wallet) is available
 * @returns {boolean}
 */
function isMetaMaskInstalled() {
  return typeof window.ethereum !== "undefined";
}

// ---- Connect Wallet ----

/**
 * Request wallet connection via MetaMask
 * Stores the connected address in currentAccount
 * @returns {Promise<string|null>} Connected address or null
 */
async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    showToast("MetaMask not found. Please install it.");
    window.open("https://metamask.io/download/", "_blank");
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      showToast("No accounts found. Please unlock MetaMask.");
      return null;
    }

    currentAccount = accounts[0];
    showToast("Wallet connected!");
    return currentAccount;
  } catch (err) {
    if (err.code === 4001) {
      showToast("Connection rejected by user.");
    } else {
      showToast("Error connecting wallet.");
      console.error("connectWallet error:", err);
    }
    return null;
  }
}

// ---- Disconnect Wallet ----

/**
 * Clear wallet state (MetaMask doesn't truly disconnect, but we clear local state)
 */
function disconnectWallet() {
  currentAccount = null;
  showToast("Wallet disconnected.");
}

// ---- Get Current Account ----

/**
 * Attempt to get already-connected account without prompting
 * Used for auto-reconnect on page load
 * @returns {Promise<string|null>}
 */
async function getConnectedAccount() {
  if (!isMetaMaskInstalled()) return null;
  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts && accounts.length > 0) {
      currentAccount = accounts[0];
      return currentAccount;
    }
    return null;
  } catch {
    return null;
  }
}

// ---- Network Check ----

/**
 * Check if user is on Base Mainnet
 * @returns {Promise<boolean>}
 */
async function isOnBaseNetwork() {
  if (!isMetaMaskInstalled()) return false;
  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    return chainId === BASE_CHAIN_ID;
  } catch {
    return false;
  }
}

// ---- Switch Network ----

/**
 * Prompt user to switch to Base Mainnet
 * Tries to add the network if not present
 */
async function switchToBaseNetwork() {
  if (!isMetaMaskInstalled()) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_CHAIN_ID }],
    });
    showToast("Switched to Base Mainnet!");
  } catch (switchError) {
    // Error 4902 = chain not added yet
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BASE_NETWORK_CONFIG],
        });
        showToast("Base network added and switched!");
      } catch (addError) {
        showToast("Could not add Base network.");
        console.error("addEthereumChain error:", addError);
      }
    } else {
      showToast("Could not switch network.");
    }
  }
}

// ---- Event Listeners ----

/**
 * Listen for account changes in MetaMask and re-initialize dashboard
 */
function listenForAccountChanges() {
  if (!isMetaMaskInstalled()) return;

  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      currentAccount = null;
      onWalletDisconnected();
    } else {
      currentAccount = accounts[0];
      onAccountChanged(currentAccount);
    }
  });
}

/**
 * Listen for chain/network changes
 */
function listenForChainChanges() {
  if (!isMetaMaskInstalled()) return;

  window.ethereum.on("chainChanged", () => {
    // Reload on chain change — recommended by MetaMask
    window.location.reload();
  });
          }
