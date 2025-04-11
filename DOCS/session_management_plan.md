# Plan: Secure Session Management with HttpOnly Cookies (Revised)

## 1. Introduction

- **Problem:** The current implementation stores the WooCommerce session token (`woo-session`) in `localStorage`, making it vulnerable to Cross-Site Scripting (XSS) attacks. Additionally, cart data is redundantly stored in `localStorage` under both `'cart-store'` (by Zustand persist middleware) and `'woocommerce-cart'` (explicitly in code).
- **Goal:** Migrate session management from `localStorage` to server-set `HttpOnly` cookies for enhanced security. Simplify cart persistence by relying solely on Zustand's built-in `persist` middleware.

## 2. Backend Changes (GraphQL Server - `process.env.NEXT_PUBLIC_GRAPHQL_URL`)

- **(Assumption):** Requires access to modify the backend GraphQL server handling authentication and sessions.
- **Modify Session Handling:**
  - **Read Token from Cookie:** Update server logic to read the session token from the `Cookie` HTTP header sent by the browser, instead of the custom `woocommerce-session` header.
  - **Set HttpOnly Cookie:** When establishing or refreshing a session, the server must send a `Set-Cookie` header in the response. This cookie should contain the session token and have the following attributes:
    - `HttpOnly`: Prevents access via client-side JavaScript.
    - `Secure`: Ensures the cookie is only sent over HTTPS connections.
    - `SameSite=Lax` (or `Strict`): Mitigates Cross-Site Request Forgery (CSRF) risks. `Lax` is generally recommended for a balance between security and usability. `Strict` offers stronger protection but might affect navigation originating from external sites.
    - `Path=/`: Ensures the cookie is sent for all paths on the domain.
    - `Max-Age` or `Expires`: Set an appropriate expiration time for the session (e.g., align with the previous 7-day logic or a shorter, security-conscious duration).
  - **Remove Custom Header Logic:** Remove the server-side logic that reads the `woocommerce-session` header and sends it back in responses.

## 3. Frontend Changes (Next.js Application)

- **Modify Apollo Client (`src/utils/apollo/ApolloClient.js`):**

  - **Remove Middleware:** Delete the `middleware` ApolloLink. The browser will automatically handle sending the `HttpOnly` cookie.
  - **Remove Afterware:** Delete the `afterware` ApolloLink. Storing the session token in `localStorage` is no longer needed.
  - **Update Client Instantiation:** Modify the `ApolloClient` instantiation to remove the `middleware` and `afterware` from the link chain.
  - **Ensure Credentials Inclusion:** Verify or explicitly set `credentials: 'include'` in the `createHttpLink` options to ensure cookies are sent with requests.
    ```javascript
    // Example modification in createHttpLink
    createHttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      fetch,
      credentials: 'include', // Ensure cookies are sent
    }),
    ```
  - **Remove Cart Clearing Logic:** Delete the line `localStorage.setItem('woocommerce-cart', JSON.stringify({}));` from the session expiration check within the (now removed) `middleware`. Cart clearing should be handled separately.

- **Modify Cart Store (`src/stores/cartStore.ts`):**

  - **Simplify Cart Persistence:**
    - Remove the explicit `localStorage.setItem('woocommerce-cart', ...)` calls from the `updateCart` and `syncWithWooCommerce` functions. Rely solely on the Zustand `persist` middleware (which uses the `'cart-store'` key in `localStorage`).
  - **Update Clearing Logic:**
    - In the `clearWooCommerceSession` function, remove the line `localStorage.removeItem('woo-session');`.
    - In the `clearWooCommerceSession` function, remove the line `localStorage.removeItem('woocommerce-cart');`.
  - **(Optional but Recommended):** Rename the `clearWooCommerceSession` function to something more accurate like `clearLocalCart` or `resetCartState`, as it will now only clear the local Zustand cart state and not the actual session cookie.

- **Review Authentication Flow:** Ensure login/logout functions correctly interact with the backend endpoints responsible for setting/clearing the `HttpOnly` session cookie.

## 4. Testing

- **Login/Logout:** Verify users can log in and log out successfully. Check browser developer tools (Network tab) to confirm the `Set-Cookie` header is received on login/session creation and that the cookie is cleared or expired on logout. Check the Application tab (Cookies) to ensure the cookie has the `HttpOnly` and `Secure` flags set.
- **Authenticated Requests:** Confirm that subsequent GraphQL requests automatically include the session cookie in the `Cookie` header and that the backend correctly identifies the user session based on this cookie.
- **Session Expiration:** Test that the session expires correctly based on the `Max-Age` or `Expires` attribute set by the server. Verify that expired sessions require re-authentication.
- **Security:** Attempt to access the session cookie via JavaScript (`document.cookie`) in the browser console; it should not be visible or accessible.
- **Cart Persistence:** Ensure the cart state (stored via Zustand persist under `'cart-store'`) remains consistent across page loads and browser sessions for logged-in users. Verify cart clearing logic works as expected.

## 5. Deployment Considerations

- **Backend First:** Deploy backend changes _before_ deploying frontend changes to ensure the server is ready to handle cookie-based sessions.
- **Environment Variables:** Ensure `NEXT_PUBLIC_GRAPHQL_URL` is correctly configured in all deployment environments.
- **HTTPS:** The `Secure` cookie attribute requires the entire site to be served over HTTPS. Ensure HTTPS is enforced in production.
- **CORS:** If the GraphQL endpoint is hosted on a different domain or subdomain than the Next.js application, ensure Cross-Origin Resource Sharing (CORS) headers (`Access-Control-Allow-Credentials: true`, `Access-Control-Allow-Origin: [Your Frontend Domain]`) are correctly configured on the backend server to allow cookies to be sent and received across origins.
