// ============================================
// transactions.js
// Fetch and paginate transaction history
// from BaseScan API
// ============================================

// Internal state for pagination
let allTransactions = [];
let filteredTransactions = [];
let currentPage = 1;
let currentFilter = "all";

/**
 * Fetch transaction list from BaseScan for a wallet
 * @param {string} address - Wallet address
 * @returns {Promise<Array>} Array of transaction objects
 */
async function fetchTransactions(address) {
  if (!address) return [];

  const url = `${BASESCAN_API_BASE}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${BASESCAN_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "1" || !Array.isArray(data.result)) {
      console.warn("BaseScan returned no results:", data.message);
      return [];
    }

    allTransactions = data.result;
    return allTransactions;
  } catch (err) {
    console.error("fetchTransactions error:", err);
    return [];
  }
}

/**
 * Determine if a transaction is sent or received
 * @param {object} tx - Transaction object from BaseScan
 * @param {string} address - Connected wallet address
 * @returns {"sent"|"received"}
 */
function getTxDirection(tx, address) {
  if (!tx || !address) return "sent";
  return tx.from.toLowerCase() === address.toLowerCase() ? "sent" : "received";
}

/**
 * Filter transactions by direction
 * @param {string} filter - "all" | "sent" | "received"
 * @param {string} address - Connected wallet address
 * @returns {Array}
 */
function filterTransactions(filter, address) {
  currentFilter = filter;
  currentPage = 1;

  if (filter === "all") {
    filteredTransactions = [...allTransactions];
  } else {
    filteredTransactions = allTransactions.filter(
      (tx) => getTxDirection(tx, address) === filter
    );
  }

  return filteredTransactions;
}

/**
 * Get a single page of transactions
 * @param {number} page - Page number (1-indexed)
 * @returns {Array}
 */
function getTransactionPage(page) {
  currentPage = page;
  const start = (page - 1) * TXS_PER_PAGE;
  const end = start + TXS_PER_PAGE;
  return filteredTransactions.slice(start, end);
}

/**
 * Get total number of pages
 * @returns {number}
 */
function getTotalPages() {
  return Math.max(1, Math.ceil(filteredTransactions.length / TXS_PER_PAGE));
}

/**
 * Go to next page
 * @returns {Array} Next page of transactions
 */
function nextPage() {
  if (currentPage < getTotalPages()) {
    currentPage++;
  }
  return getTransactionPage(currentPage);
}

/**
 * Go to previous page
 * @returns {Array} Previous page of transactions
 */
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
  }
  return getTransactionPage(currentPage);
}

/**
 * Get current page number
 * @returns {number}
 */
function getCurrentPage() {
  return currentPage;
}

/**
 * Reset pagination state
 */
function resetTransactions() {
  allTransactions = [];
  filteredTransactions = [];
  currentPage = 1;
  currentFilter = "all";
}
