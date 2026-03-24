// api/_lib/parse-cookies.js
'use strict';

/**
 * Parses a Cookie header string into a key-value object.
 * @param {string} cookieHeader - The value of the Cookie request header
 * @returns {Object} - Key-value pairs of cookie names and values
 */
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const eqIndex = cookie.indexOf('=');
    if (eqIndex === -1) return acc;
    const key = cookie.substring(0, eqIndex).trim();
    const val = cookie.substring(eqIndex + 1).trim();
    acc[key] = val;
    return acc;
  }, {});
}

module.exports = { parseCookies };
