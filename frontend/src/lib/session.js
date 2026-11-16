// Centralized helpers for storing and reading multi-role sessions.
// This app supports concurrent sessions (buyer, seller, admin) by using different storage keys.

export const STORAGE_KEYS = {
  buyer: "std_userInfo",
  seller: "seller_userInfo",
  admin: "admin_userInfo"
};

function safeParseJSON(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function readSession(key) {

  const fromSession = safeParseJSON(sessionStorage.getItem(key));
  if (fromSession) return fromSession;

  const fromLocal = safeParseJSON(localStorage.getItem(key));
  if (fromLocal) {
  
    try {
      sessionStorage.setItem(key, JSON.stringify(fromLocal));
    } catch {

    }

    try {
      localStorage.removeItem(key);
    } catch {

    }
    return fromLocal;
  }

  return null;
}

export function writeSession(key, data) {
  sessionStorage.setItem(key, JSON.stringify(data));

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

export function clearSession(key) {
  sessionStorage.removeItem(key);
  // Also clear legacy localStorage to avoid new tabs accidentally picking it up.
  localStorage.removeItem(key);
}

// Buyer pages prefer buyer session, but can fall back to seller session (same JWT works).
export function getBuyerSessionWithKey() {
  const buyer = readSession(STORAGE_KEYS.buyer);
  if (buyer?.token) return { key: STORAGE_KEYS.buyer, session: buyer };

  const seller = readSession(STORAGE_KEYS.seller);
  if (seller?.token) return { key: STORAGE_KEYS.seller, session: seller };

  return { key: STORAGE_KEYS.buyer, session: {} };
}

// Seller pages prefer seller session, but can fall back to buyer session if needed.
export function getSellerSessionWithKey() {
  const seller = readSession(STORAGE_KEYS.seller);
  if (seller?.token) return { key: STORAGE_KEYS.seller, session: seller };

  const buyer = readSession(STORAGE_KEYS.buyer);
  if (buyer?.token) return { key: STORAGE_KEYS.buyer, session: buyer };

  return { key: STORAGE_KEYS.seller, session: {} };
}

export function getAdminSessionWithKey() {
  const admin = readSession(STORAGE_KEYS.admin);
  if (admin?.token) return { key: STORAGE_KEYS.admin, session: admin };
  return { key: STORAGE_KEYS.admin, session: {} };
}

export function setSessionForRole(userData) {
  const role = String(userData?.role || "").toLowerCase();

  if (role === "admin" || role === "sportadmin") {
    // Keep one active session per tab to avoid cross-role name/session mixups.
    clearSession(STORAGE_KEYS.buyer);
    clearSession(STORAGE_KEYS.seller);
    writeSession(STORAGE_KEYS.admin, userData);
    return STORAGE_KEYS.admin;
  }

  if (role === "seller") {
    // Keep one active session per tab to avoid cross-role name/session mixups.
    clearSession(STORAGE_KEYS.buyer);
    clearSession(STORAGE_KEYS.admin);
    writeSession(STORAGE_KEYS.seller, userData);
    return STORAGE_KEYS.seller;
  }

  clearSession(STORAGE_KEYS.seller);
  clearSession(STORAGE_KEYS.admin);
  writeSession(STORAGE_KEYS.buyer, userData);
  return STORAGE_KEYS.buyer;
}
