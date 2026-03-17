// ============================================
// utils/shortAddress.js
// Utility to shorten Ethereum addresses
// ============================================

/**
 * Shorten an Ethereum address to format: 0x1234...abcd
 * @param {string} address - Full Ethereum address
 * @param {number} startChars - Characters to show at start (after 0x)
 * @param {number} endChars - Characters to show at end
 * @returns {string}
 */
function shortAddress(address, startChars = 4, endChars = 4) {
  if (!address) return "—";
  if (address.length < 12) return address;
  const start = address.slice(0, startChars + 2); // includes "0x"
  const end   = address.slice(-endChars);
  return `${start}...${end}`;
}

/**
 * Check if a string looks like a valid Ethereum address
 * @param {string} address
 * @returns {boolean}
 */
function isValidAddress(address) {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Convert address to checksum format (simple toUpperCase for display)
 * @param {string} address
 * @returns {string}
 */
function checksumAddress(address) {
  if (!address) return "";
  return address.toLowerCase();
}
