# Plan: Basic CSP & Cart Cleanup (Revised)

## 1. Introduction

*   **Problem:** The session token (`woo-session`) stored in `localStorage` is vulnerable to Cross-Site Scripting (XSS) attacks. Implementing a full Content Security Policy (CSP) can be time-consuming. Additionally, cart data is redundantly stored in `localStorage` under both `'cart-store'` (by Zustand persist middleware) and `'woocommerce-cart'` (explicitly in code).
*   **Goal:** Mitigate the primary XSS risk by implementing a **basic Content Security Policy** focusing on script execution (`script-src`) and API connections (`connect-src`). Improve code hygiene by simplifying cart persistence logic. This approach balances security improvement with implementation time.

## 2. Implement Basic Content Security Policy (CSP)

*   **Focus:** Primarily target the `script-src` and `connect-src` directives to prevent unauthorized script execution and restrict API endpoints. Other directives (like `style-src`, `img-src`) will not be part of this initial basic implementation but can be added later.
*   **Audit Sources:** Identify essential sources for:
    *   **Scripts (`script-src`):** Own domain (`'self'`), required CDNs (if any), analytics providers (if any).
    *   **Connections (`connect-src`):** Own domain (`'self'`), the GraphQL endpoint (`process.env.NEXT_PUBLIC_GRAPHQL_URL`), analytics endpoints (if any).
*   **Draft Policy (Iterative Process):**
    *   Start with a base policy focusing on the target directives. Example:
        ```
        default-src 'self'; script-src 'self' 'nonce-{NONCE_PLACEHOLDER}' 'unsafe-eval' [ALLOWED_SCRIPT_SOURCES...]; connect-src 'self' [GraphQL_URL] [ALLOWED_API_SOURCES...]; report-uri /api/csp-violations;
        ```
        *(Note: Replace placeholders like `{NONCE_PLACEHOLDER}`, `[ALLOWED_SCRIPT_SOURCES...]`, `[GraphQL_URL]`, `[ALLOWED_API_SOURCES...]` with actual values. `'unsafe-eval'` might be required for Next.js development mode or certain libraries; aim to remove it for production if feasible.)*
    *   Use the `Content-Security-Policy-Report-Only` header initially. Configure a reporting endpoint (e.g., using `report-uri` or `report-to`) to collect violation reports without blocking resources.
    *   Analyze violation reports to identify and add any missed essential script or connection sources to the policy.
*   **Handle Next.js Nonces:**
    *   Ensure the `script-src` directive includes the `'nonce-{NONCE_PLACEHOLDER}'`.
    *   Configure Next.js (likely in `next.config.js`) to generate and inject nonces into its inline scripts. This allows legitimate Next.js scripts while blocking others.
*   **Implementation:** Add the CSP header configuration within `next.config.js` using the `headers` function.
*   **Testing:**
    *   Thoroughly test all site functionality with the CSP in `Report-Only` mode in development and staging environments.
    *   Monitor violation reports closely.
    *   Once confident, switch to the enforcing `Content-Security-Policy` header in a testing environment before deploying to production.

## 3. Simplify Cart Persistence

*   **Modify Apollo Client (`src/utils/apollo/ApolloClient.js`):**
    *   Locate the `middleware` ApolloLink.
    *   Within the session expiration check (`if (Date.now() - createdTime > SEVEN_DAYS)`), remove the line: `localStorage.setItem('woocommerce-cart', JSON.stringify({}));`.
*   **Modify Cart Store (`src/stores/cartStore.ts`):**
    *   In the `updateCart` function, remove the line: `localStorage.setItem('woocommerce-cart', JSON.stringify(newCart));`.
    *   In the `syncWithWooCommerce` function, remove the line: `localStorage.setItem('woocommerce-cart', JSON.stringify(cart));`.
    *   In the `clearWooCommerceSession` function, remove the line: `localStorage.removeItem('woocommerce-cart');`.
    *   *(Keep `localStorage.removeItem('woo-session');` in `clearWooCommerceSession` as the token remains in localStorage).*

## 4. Other Frontend Security Best Practices (Maintain)

*   **Dependency Management:** Continue using tools like Renovate and regularly run `npm audit` to keep dependencies updated and patch known vulnerabilities.

## 5. Summary

This plan focuses on achieving a tangible security improvement against XSS by implementing a targeted, basic CSP, while also cleaning up the cart persistence code. It acknowledges the time constraints associated with a full CSP rollout. The session token remains in `localStorage`, but its potential misuse via script injection is significantly reduced.
