# 🛋️ POC Roadmap: 3D Furniture Configurator E-commerce

**Realistic 10-Week MVP Plan with Parallel Work Tracks**

**Document Version:** 8.0 – Updated to Current State  
**Date:** November 30, 2025  
**Authors:** Senior Product Owner & Tech Lead  
**Status:** Phase 1 Track A Complete - In Progress

---

## Executive Summary

This POC roadmap delivers a **fully functional 3D furniture configurator e-commerce platform** within 10 weeks. **Track A (WooCommerce Backend) is complete** - the backend is deployed at `wordpress2533583.home.pl` and serving live data. Focus now shifts to frontend optimization (Track B) and e-commerce integration (Track C).

### Current State Analysis (Verified via Codebase)

✅ **Production Ready:**

- Next.js 15.5.6 on Render.com with Pages Router
- **WooCommerce backend deployed** at `wordpress2533583.home.pl/graphql`
- **Live GraphQL API** (mocks disabled in production)
- **WordPress plugin installed** (`mebl-configurator-bridge`) with `modelId` field
- 3D Configurator (React Three Fiber) integrated on ProductPage
- Apollo Client 3.14.0 querying live WooCommerce data
- Zustand state management (cart with localStorage persistence)
- Valtio state management (configurator - **memory only, no persistence**)
- Three 3D models: Cabinet, Shelf, Dresser (with dimension controls)
- Authentication system (login, protected routes with `withAuth` HOC)
- Cart system with WooCommerce session management
- Basic checkout flow (COD payment only)
- Currency handling configured for PLN

❌ **Missing/Incomplete:**

- **Configurator state not persisted** (dimensions/colors lost on refresh) ⚠️ PRIORITY
- **No dynamic pricing** (price doesn't update with dimension changes) ⚠️ PRIORITY
- **Configurator state not saved to cart** (custom config not attached to orders) ⚠️ PRIORITY
- **No payment gateway** (only COD placeholder in code)
- **No analytics tracking** (no GA4, conversion funnels, or performance metrics)
- **Limited mobile optimization** (touch gestures, responsive controls)
- **No product reviews system** (types exist but no UI/mutations)
- **No shipping options** (hardcoded text, no real shipping methods)
- **No pricing formulas in WooCommerce** (need custom meta fields for dimension-based pricing)

### E-commerce Maturity Assessment

**Current Level:** **Beginner → Competent** (Transitioning)

Based on industry maturity model:

- ✅ Functioning online store with cart and checkout
- ✅ Single sales channel (own website)
- ⚠️ Limited payment methods (COD only)
- ❌ No data-driven decisions (no analytics)
- ❌ No personalization or customer reviews
- ❌ No cross-border or multi-channel support

**Target Level for POC:** **Competent → Proficient**

- Add dynamic pricing based on configuration
- Implement real payment gateway (Przelewy24)
- Add analytics for data-driven optimization
- Enable customer reviews and testimonials
- Optimize for mobile (touch gestures, responsive)
- Improve SEO and product page optimization

---

## Strategic Approach: 3-Track Parallel Development

To avoid blocking on WooCommerce setup, work is organized into **3 parallel tracks**:

### ✅ **Track A: Backend Foundation** (COMPLETED)

WooCommerce deployment and API integration.

**Owner:** DevOps + Backend Dev  
**Duration:** Days 1-5 (Week 1)  
**Status:** ✅ COMPLETE - Backend live at `wordpress2533583.home.pl`  
**Achievements:**

- WordPress + WooCommerce deployed with SSL
- GraphQL endpoint active and tested
- WordPress plugin (`mebl-configurator-bridge`) installed
- Products queryable via GraphQL with `modelId` field
- CORS configured for Next.js domain
- Mocks disabled in production (`render.yaml`)

### 🟢 **Track B: Frontend Optimization** (ACTIVE - START HERE)

Configurator improvements, performance, mobile UX.

**Owner:** Frontend Team  
**Duration:** Weeks 1-3  
**Status:** 🔄 IN PROGRESS - Top priority tasks identified  
**Current Focus:**

1. EPIC 1.C: Configurator State Persistence (localStorage)
2. EPIC 1.D: Dynamic Pricing Calculation
3. EPIC 1.E: Mobile Touch Gestures
4. EPIC 1.F: Performance Optimization

### 🟡 **Track C: Integration & E-commerce** (READY TO START)

Cart integration, payments, analytics. **Backend ready - can start immediately.**

**Owner:** Full-stack Team  
**Duration:** Weeks 2-7  
**Status:** ✅ UNBLOCKED - Track A complete, can proceed  
**Next Steps:**

- EPIC 2.A: Save Configuration to Cart (backend supports meta fields)
- EPIC 2.B: Checkout Flow Enhancement
- EPIC 2.C: Payment Gateway Integration (Przelewy24)

---

## Phase 0: Pre-Flight Checklist (Day -1 to 0)

**Goal:** Validate assumptions and prepare infrastructure

### Tasks

- [x] **Confirm WooCommerce hosting plan** ✅ Using `wordpress2533583.home.pl`
- [x] **Domain/subdomain for WordPress** ✅ Live at `wordpress2533583.home.pl`
- [x] **SSL certificate for WordPress domain** ✅ HTTPS enabled
- [ ] **Algolia account credentials** (for product search) - Config exists but needs real credentials
- [ ] **Przelewy24 merchant account** (for payment gateway)
- [ ] **GA4 property setup** (for analytics tracking)
- [x] **Production environment on Render.com** ✅ Deployed with mocks disabled

**Deliverables:**

- Infrastructure access credentials document
- Environment variables template with real values
- Risk assessment document with mitigation plans

---

## Phase 1: Foundation & Parallel Optimization (Weeks 1-3)

**Goal:** Set up WooCommerce backend while simultaneously improving frontend

### 🔴 **TRACK A: WooCommerce Backend Setup**

#### **EPIC 1.A: WordPress & WooCommerce Deployment**

**Priority:** P0 (Critical)  
**Duration:** 3-5 days  
**Owner:** DevOps

**User Story:**

> As a developer, I need a production WooCommerce backend so that the Next.js app can create real orders and process payments.

**Tasks:**

1. **Provision WordPress hosting**
   - Choose hosting provider (Render.com, Kinsta, WP Engine, or VPS)
   - Set up domain/subdomain with SSL
   - Install WordPress 6.8+ (latest stable)
   - Configure PHP 8.1+, MySQL 8.0+
   - Set up automated backups (daily)

2. **Install required plugins**
   - WooCommerce 9.9+ (core e-commerce)
   - WP GraphQL 2.3+ (GraphQL API)
   - WooGraphQL 0.19+ (WooCommerce GraphQL extension)
   - WPGraphQL CORS 2.1+ (enable Next.js domain)
   - [wp-algolia-woo-indexer](https://github.com/w3bdesign/wp-algolia-woo-indexer) (product search)
   - Headless WordPress (optional - disable frontend)

3. **Configure WooCommerce**
   - Set currency (PLN for Przelewy24)
   - Add sample products (furniture categories)
   - Configure product attributes (dimensions, materials, colors)
   - Enable COD payment method (initial testing)
   - Set up basic shipping zones (Poland domestic)

4. **Configure WP GraphQL**
   - Enable WooCommerce extensions in GraphQL settings
   - Whitelist Next.js domain in CORS settings
   - Test GraphQL endpoint with Apollo Studio
   - Document all custom fields and meta data

5. **Test GraphQL queries**
   ```graphql
   # Test queries from src/utils/gql/GQL_QUERIES.ts
   - GET_PRODUCTS
   - GET_SINGLE_PRODUCT
   - GET_CART
   - GET_CUSTOMER_ORDERS
   ```

**Acceptance Criteria:**

- [ ] GraphQL endpoint responds to `GET_PRODUCTS` query
- [ ] Can create cart and add products via mutations
- [ ] Sample furniture products visible in GraphQL
- [ ] CORS allows requests from Next.js domain
- [ ] Session tokens persist in localStorage

**Estimated Effort:** 24-32 hours  
**Risks:**

- Plugin version compatibility issues → Mitigation: Test in staging first
- CORS misconfiguration → Mitigation: Use WPGraphQL CORS plugin
- Slow hosting performance → Mitigation: Load test before launch

---

#### **EPIC 1.B: Product Meta Fields for Configurator**

**Priority:** P0 (Critical)  
**Duration:** 1-2 days  
**Owner:** Backend Dev  
**Dependencies:** EPIC 1.A complete

**User Story:**

> As a product manager, I need to enable/disable the 3D configurator per product and set pricing rules so that custom furniture can be sold.

**Tasks:**

1. **Create custom product meta fields in WooCommerce**
   - `_configurator_enabled` (boolean) - Enable 3D configurator
   - `_configurator_model_id` (string) - Model registry key (`cabinet-v1`, `shelf-v1`)
   - `_configurator_default_config` (JSON) - Default colors/dimensions
   - `_configurator_pricing` (JSON) - Dynamic pricing formula

2. **Extend WPGraphQL schema**

   ```graphql
   type Product {
     configurator {
       enabled: Boolean
       modelId: String
       defaultConfiguration: String
       customPricing: String
     }
   }
   ```

3. **Add meta boxes to WooCommerce admin**
   - Configurator settings panel in product edit screen
   - Visual model selector (cabinet vs shelf)
   - Pricing formula builder (base + dimension multipliers)

4. **Seed sample products**
   - "Modern Bar Cabinet" → cabinet-v1 → Pricing: 2000 PLN base + 10 PLN/cm²
   - "Bedroom Shelf Unit" → shelf-v1 → Fixed price: 1500 PLN

**Acceptance Criteria:**

- [ ] GraphQL query returns `configurator` field for products
- [ ] Admin can enable/disable configurator per product
- [ ] Pricing formula saved and retrieved correctly
- [ ] Existing `GET_SINGLE_PRODUCT` query works with new fields

**Estimated Effort:** 12-16 hours

---

### 🟢 **TRACK B: Frontend Optimization (Parallel)**

#### **EPIC 1.C: Configurator State Persistence**

**Priority:** P1 (High)  
**Duration:** 2-3 days  
**Owner:** Frontend Dev  
**Dependencies:** None (can start immediately)

**User Story:**

> As a customer, I want my furniture configuration (colors, dimensions) to persist when I refresh the page so I don't lose my customizations.

**Tasks:**

1. **Analyze current Valtio store implementation**
   - Review `src/stores/configuratorStore.ts` (currently memory-only)
   - Identify what needs persistence: `items`, `dimensions`, `interactiveStates`

2. **Add localStorage persistence to Valtio**

   ```typescript
   // src/stores/configuratorStore.ts
   import { subscribe } from 'valtio';

   // Subscribe to state changes and save to localStorage
   subscribe(configuratorState, () => {
     const stateToSave = {
       items: configuratorState.items,
       dimensions: configuratorState.dimensions,
       interactiveStates: configuratorState.interactiveStates,
     };
     localStorage.setItem('configurator-state', JSON.stringify(stateToSave));
   });

   // Restore from localStorage on init
   if (typeof window !== 'undefined') {
     const saved = localStorage.getItem('configurator-state');
     if (saved) {
       const parsed = JSON.parse(saved);
       Object.assign(configuratorState, parsed);
     }
   }
   ```

3. **Add state restoration UI**
   - Show notification: "We restored your previous configuration"
   - Add "Reset to defaults" button in configurator
   - Clear localStorage when user starts fresh configuration

4. **Handle model switching**
   - Clear configurator state when switching products
   - Validate saved state matches current model (cabinet vs shelf)

**Acceptance Criteria:**

- [ ] Configuration survives page refresh
- [ ] State cleared when navigating to different product
- [ ] No hydration errors in Next.js SSR
- [ ] Works in Safari private mode (handle localStorage errors)

**Estimated Effort:** 16-20 hours  
**Testing:** Manual + Playwright test for persistence

---

#### **EPIC 1.D: Dynamic Pricing Calculation**

**Priority:** P1 (High)  
**Duration:** 3-4 days  
**Owner:** Frontend Dev  
**Dependencies:** None (can use mock pricing initially)

**User Story:**

> As a customer, I want to see the price update in real-time as I adjust furniture dimensions so I understand the cost impact.

**Tasks:**

1. **Define pricing formula structure**

   ```typescript
   // src/types/configurator.ts
   export interface PricingFormula {
     basePrice: number; // Starting price in PLN
     dimensionMultipliers?: {
       width: number; // PLN per cm
       height: number; // PLN per cm
       depth: number; // PLN per cm
     };
     areaMultiplier?: number; // PLN per cm² (width * height)
     volumeMultiplier?: number; // PLN per cm³ (W * H * D)
     materialPrices?: Record<string, number>; // Color/material price modifiers
   }
   ```

2. **Create pricing calculation utility**

   ```typescript
   // src/utils/pricing.ts
   export function calculatePrice(
     basePrice: number,
     dimensions: { width: number; height: number; depth: number },
     formula: PricingFormula,
   ): number {
     let price = basePrice;

     if (formula.areaMultiplier) {
       const area = dimensions.width * dimensions.height;
       price += area * formula.areaMultiplier;
     }

     if (formula.dimensionMultipliers) {
       price += dimensions.width * formula.dimensionMultipliers.width;
       price += dimensions.height * formula.dimensionMultipliers.height;
       price += dimensions.depth * formula.dimensionMultipliers.depth;
     }

     return Math.round(price * 100) / 100; // Round to 2 decimals
   }
   ```

3. **Update PricingSection component**

   ```typescript
   // src/components/Product/PricingSection.component.tsx
   import { useSnapshot } from 'valtio';
   import { configuratorState } from '@/stores/configuratorStore';
   import { calculatePrice } from '@/utils/pricing';

   // Subscribe to configurator state changes
   const snap = useSnapshot(configuratorState);
   const dynamicPrice = calculatePrice(
     product.basePrice,
     snap.dimensions,
     product.configurator?.customPricing || {},
   );
   ```

4. **Add pricing breakdown UI**
   - Show formula in tooltip: "Base: 2000 PLN + Area (120×150cm): 180 PLN = 2180 PLN"
   - Highlight dimension that affects price most
   - Show savings when reducing dimensions

5. **Mock pricing data during Phase 1**
   ```typescript
   // src/config/mockPricing.ts
   export const MOCK_PRICING: Record<string, PricingFormula> = {
     'cabinet-v1': {
       basePrice: 2000,
       areaMultiplier: 0.01, // 1 grosz per cm²
       materialPrices: { '#8B4513': 0, '#000000': 200 }, // Black +200 PLN
     },
     'shelf-v1': {
       basePrice: 1500,
       materialPrices: {},
     },
   };
   ```

**Acceptance Criteria:**

- [ ] Price updates instantly when dimensions change
- [ ] Formula matches expected calculations (verified with unit tests)
- [ ] Price never goes negative or NaN
- [ ] Works with WooCommerce pricing when backend ready
- [ ] Graceful fallback to static price if formula missing

**Estimated Effort:** 20-24 hours  
**Testing:** Unit tests for `calculatePrice()` + visual regression tests

---

#### **EPIC 1.E: Mobile Touch Gestures**

**Priority:** P2 (Medium)  
**Duration:** 2-3 days  
**Owner:** Frontend Dev  
**Dependencies:** None

**User Story:**

> As a mobile customer, I want to rotate and zoom the 3D model with touch gestures so I can customize furniture on my phone.

**Tasks:**

1. **Audit current mobile experience**
   - Test on iOS Safari, Android Chrome
   - Identify pain points (controls too small, gestures not working)
   - Lighthouse mobile audit

2. **Implement touch controls for Three.js**

   ```typescript
   // src/components/Configurator/Canvas3D.component.tsx
   import { OrbitControls } from '@react-three/drei';

   <OrbitControls
     enablePan={false} // Disable pan on mobile (prevents scroll issues)
     enableZoom={true}
     minDistance={2}
     maxDistance={10}
     touches={{
       ONE: THREE.TOUCH.ROTATE,    // One finger = rotate
       TWO: THREE.TOUCH.DOLLY_PAN, // Two fingers = zoom/pan
     }}
   />
   ```

3. **Improve mobile UI**
   - Make color palette larger on mobile (min 44×44px touch targets)
   - Stack dimension sliders vertically on mobile
   - Add "Reset View" button (large, bottom-right corner)
   - Show loading spinner during model load

4. **Add gesture hints**
   - First-time user: "Use one finger to rotate, two to zoom"
   - Fade out after 3 seconds or first interaction

**Acceptance Criteria:**

- [ ] Smooth rotation with one finger swipe
- [ ] Pinch-to-zoom works on iOS and Android
- [ ] No accidental page scrolling while interacting with canvas
- [ ] Touch targets meet WCAG 2.1 size guidelines (44×44px)
- [ ] Lighthouse mobile score >80

**Estimated Effort:** 16-20 hours

---

#### **EPIC 1.F: Performance Optimization**

**Priority:** P2 (Medium)  
**Duration:** 2 days  
**Owner:** Frontend Dev  
**Dependencies:** None

**User Story:**

> As a developer, I need the configurator to load fast and run smoothly so customers don't abandon due to poor performance.

**Tasks:**

1. **Run Lighthouse CI audit**

   ```bash
   npm run lhci:perf
   ```

   - Identify bottlenecks (large models, unoptimized images, unused JS)

2. **Optimize 3D models**
   - Compress `.glb` files with [gltf-pipeline](https://github.com/CesiumGS/gltf-pipeline)
   - Target: Cabinet <500KB, Shelf <300KB
   - Use Draco compression for geometry

3. **Lazy load configurator**
   - Already implemented with `next/dynamic` in `SingleProduct.component.tsx`
   - Verify no SSR hydration errors

4. **Add error boundaries**
   - Already exists: `Canvas3DErrorBoundary.component.tsx`
   - Add Sentry integration for error reporting
   - Show friendly fallback UI: "3D configurator unavailable. Please refresh."

5. **Optimize bundle size**
   - Analyze with `next build` + `@next/bundle-analyzer`
   - Code-split Three.js (only load on product pages with configurator)
   - Remove unused Radix UI components

**Acceptance Criteria:**

- [ ] Lighthouse Performance score >85 (desktop)
- [ ] Lighthouse Performance score >75 (mobile)
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <4s
- [ ] Model loads in <3s on 4G connection

**Estimated Effort:** 12-16 hours

---

### 📊 **Phase 1 Milestone: Week 3 Demo**

**Deliverables:**

- ✅ WooCommerce backend live with GraphQL API
- ✅ Configurator state persists across sessions
- ✅ Dynamic pricing updates in real-time
- ✅ Mobile-friendly touch controls
- ✅ Performance benchmarks documented

**Success Metrics:**

- Lighthouse Performance >85 (desktop), >75 (mobile)
- Configurator loads in <3s
- Zero SSR hydration errors
- Manual QA passed on iOS Safari, Android Chrome, Desktop browsers

---

## Phase 2: E-commerce Integration (Weeks 4-5)

**Goal:** Connect configurator to cart/checkout and enable real purchases

### 🟡 **TRACK C: Cart & Configuration Serialization**

#### **EPIC 2.A: Save Configuration to Cart**

**Priority:** P0 (Critical)  
**Duration:** 3-4 days  
**Owner:** Full-stack Dev  
**Dependencies:** EPIC 1.A, 1.B complete

**User Story:**

> As a customer, I want my custom furniture configuration to be saved with my cart item so the manufacturer knows exactly what to build.

**Tasks:**

1. **Design configuration serialization format**

   ```typescript
   // src/types/configurator.ts
   export interface SerializedConfiguration {
     modelId: string; // 'cabinet-v1'
     dimensions: {
       width: number;
       height: number;
       depth: number;
     };
     colors: Record<string, string>; // { 'Cabinet_m_cabinet_0': '#8B4513' }
     interactiveStates: Record<string, boolean>; // { 'leftDoor': true }
     timestamp: string; // ISO 8601
     version: string; // '1.0' for future schema migrations
   }
   ```

2. **Add configuration to cart mutation**

   ```typescript
   // src/utils/gql/GQL_MUTATIONS.ts
   export const ADD_TO_CART = gql`
     mutation AddToCart($input: AddToCartInput!) {
       addToCart(input: $input) {
         cart {
           contents {
             nodes {
               key
               product {
                 name
               }
               quantity
               extraData {
                 # Custom meta data
                 key
                 value
               }
             }
           }
         }
       }
     }
   `;
   ```

3. **Extend WooCommerce to store cart item meta**
   - WP Plugin: Hook into `woocommerce_add_cart_item_data`
   - Save `configuration_json` as cart item meta
   - Display in admin order details (JSON pretty-printed)

4. **Update AddToCartButton component**

   ```typescript
   // src/components/Product/AddToCartButton.component.tsx
   const handleAddToCart = async () => {
     const config = serializeConfiguration(configuratorState);

     const input = {
       productId: product.databaseId,
       quantity: 1,
       extraData: [
         { key: 'configurator_config', value: JSON.stringify(config) },
       ],
     };

     await addToCart({ variables: { input } });
   };
   ```

5. **Display configuration in cart**
   - Show thumbnail preview: "Custom Cabinet (120×150×45 cm, Brown)"
   - Add "Edit Configuration" link → reload configurator with saved state
   - Show price breakdown in cart (dynamic price)

**Acceptance Criteria:**

- [ ] Configuration saved to cart item when "Add to Cart" clicked
- [ ] Cart displays dimensions and color selections
- [ ] Configuration survives cart persistence (localStorage + WooCommerce session)
- [ ] Admin can view configuration JSON in order details
- [ ] "Edit Configuration" restores exact state in configurator

**Estimated Effort:** 20-24 hours

---

#### **EPIC 2.B: Checkout Flow Enhancement**

**Priority:** P1 (High)  
**Duration:** 2-3 days  
**Owner:** Full-stack Dev  
**Dependencies:** EPIC 2.A

**User Story:**

> As a customer, I want a smooth checkout experience with clear shipping options and order confirmation so I trust the purchase process.

**Tasks:**

1. **Add shipping methods in WooCommerce**
   - Flat rate shipping: 50 PLN (Poland)
   - Free shipping over 5000 PLN
   - Pickup in store: 0 PLN (Warsaw location)

2. **Update checkout form with shipping selection**

   ```typescript
   // src/components/Checkout/Billing.component.tsx
   <FormField name="shippingMethod">
     <FormLabel>Shipping Method</FormLabel>
     <RadioGroup>
       <RadioGroupItem value="flat_rate">
         Courier Delivery (50 PLN) - 3-4 weeks
       </RadioGroupItem>
       <RadioGroupItem value="local_pickup">
         Pickup in Warsaw (Free)
       </RadioGroupItem>
     </RadioGroup>
   </FormField>
   ```

3. **Add order summary with configuration preview**
   - Show 3D thumbnail (screenshot of configured model)
   - List dimensions and colors
   - Show price breakdown:
     ```
     Base Cabinet:       2000 PLN
     Custom Size Charge:  180 PLN
     Subtotal:           2180 PLN
     Shipping:             50 PLN
     Total:              2230 PLN
     ```

4. **Improve order confirmation**
   - Display order number prominently
   - Estimated delivery date: "Expected: January 15, 2026"
   - Download configuration as PDF (optional Phase 3)
   - Email with configuration details

**Acceptance Criteria:**

- [ ] Customer can select shipping method
- [ ] Shipping cost calculated correctly in checkout
- [ ] Order confirmation shows configuration summary
- [ ] Email sent with order details and configuration

**Estimated Effort:** 16-20 hours

---

#### **EPIC 2.C: Payment Gateway Integration (Przelewy24)**

**Priority:** P0 (Critical)  
**Duration:** 4-5 days  
**Owner:** Backend + Full-stack Dev  
**Dependencies:** Przelewy24 merchant account

**User Story:**

> As a customer, I want to pay securely with my credit card or bank transfer so I can complete my furniture purchase.

**Tasks:**

1. **Install Przelewy24 WooCommerce plugin**
   - Download from [Przelewy24 GitHub](https://github.com/przelewy24/p24-plugin-woocommerce)
   - Configure merchant credentials (API keys from Przelewy24 dashboard)
   - Set up webhook endpoint for payment confirmations

2. **Configure payment settings**
   - Enable credit cards, bank transfers, BLIK
   - Set currency to PLN
   - Configure return URLs (success/failure)
   - Test in Przelewy24 sandbox mode

3. **Update checkout form**

   ```typescript
   // src/components/Checkout/Billing.component.tsx
   <input type="hidden" name="paymentMethod" value="przelewy24" />
   ```

4. **Handle payment redirect flow**
   - After "Place Order", redirect to Przelewy24 payment page
   - Implement return URL handler: `/order-confirmation?payment=success&order={id}`
   - Show payment status: "Processing payment..." → "Payment confirmed!"

5. **Test payment flows**
   - Successful payment → Order status "Processing"
   - Failed payment → Order status "Pending Payment" → Send reminder email
   - Cancelled payment → Redirect back to cart with error message

6. **Security audit**
   - Verify webhook signature validation
   - Test against common payment fraud scenarios
   - Implement rate limiting on checkout endpoint

**Acceptance Criteria:**

- [ ] Customer can complete purchase with real credit card (sandbox)
- [ ] Payment confirmation updates order status in WooCommerce
- [ ] Webhook validates signatures to prevent fraud
- [ ] Failed payments handled gracefully with retry option
- [ ] Payment data never stored in frontend (PCI compliance)

**Estimated Effort:** 28-32 hours

---

### 📊 **Phase 2 Milestone: Week 5 Demo**

**Deliverables:**

- ✅ Customers can add configured furniture to cart
- ✅ Configuration saved with cart items (visible in admin)
- ✅ Shipping options displayed in checkout
- ✅ Przelewy24 payments working end-to-end
- ✅ Order confirmation emails with configuration details

**Success Metrics:**

- End-to-end purchase flow completes without errors
- Cart persistence works across sessions
- Payment webhook latency <2s
- Zero abandoned checkouts due to technical errors

---

## Phase 3: Analytics & Optimization (Weeks 6-7)

**Goal:** Add tracking, reviews, and polish the user experience

### 🟡 **TRACK C: Analytics & Insights**

#### **EPIC 3.A: Google Analytics 4 Integration**

**Priority:** P1 (High)  
**Duration:** 2-3 days  
**Owner:** Frontend Dev  
**Dependencies:** GA4 property created

**User Story:**

> As a product manager, I need analytics data on customer behavior so I can optimize the configurator and increase conversions.

**Tasks:**

1. **Install GA4 script in Next.js**

   ```typescript
   // src/pages/_app.tsx
   import Script from 'next/script';

   <Script
     src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`}
     strategy="afterInteractive"
   />
   <Script id="google-analytics" strategy="afterInteractive">
     {`
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}');
     `}
   </Script>
   ```

2. **Track configurator interactions**

   ```typescript
   // src/utils/analytics.ts
   export const trackConfiguratorEvent = (action: string, params: object) => {
     if (window.gtag) {
       window.gtag('event', action, {
         event_category: 'configurator',
         ...params,
       });
     }
   };

   // Usage in components:
   trackConfiguratorEvent('dimension_changed', {
     dimension: 'width',
     value: 120,
     modelId: 'cabinet-v1',
   });

   trackConfiguratorEvent('color_selected', {
     color: '#8B4513',
     part: 'Cabinet Body',
   });
   ```

3. **Track e-commerce events**
   - `view_item` - Product page viewed
   - `add_to_cart` - Item added to cart
   - `begin_checkout` - Checkout started
   - `purchase` - Order completed
   - Custom event: `configurator_completed` - User finished customizing

4. **Set up conversion goals in GA4**
   - Goal 1: Configurator engagement (>30s interaction time)
   - Goal 2: Add to cart from configurator
   - Goal 3: Purchase completion
   - Goal 4: Configuration downloaded (Phase 4)

5. **Create custom dimensions**
   - `configurator_enabled` (yes/no) - Product has configurator
   - `model_type` (cabinet/shelf) - Which model viewed
   - `custom_dimensions_used` (yes/no) - User changed dimensions
   - `custom_colors_used` (yes/no) - User changed colors

**Acceptance Criteria:**

- [ ] GA4 receives events from configurator interactions
- [ ] E-commerce funnel visible in GA4 reports
- [ ] Custom dimensions tracked correctly
- [ ] Real-time report shows active users in configurator
- [ ] No GA4 errors in browser console

**Estimated Effort:** 16-20 hours

---

#### **EPIC 3.B: Customer Reviews System**

**Priority:** P2 (Medium)  
**Duration:** 3-4 days  
**Owner:** Full-stack Dev  
**Dependencies:** EPIC 1.A (WooCommerce)

**User Story:**

> As a potential customer, I want to read reviews from other buyers so I can trust the quality of the furniture.

**Tasks:**

1. **Enable WooCommerce reviews**
   - Enable reviews in WooCommerce settings
   - Configure moderation (approve before publishing vs auto-publish)
   - Allow only verified buyers to review

2. **Create reviews UI component**

   ```typescript
   // src/components/Product/ProductReviews.component.tsx
   interface Review {
     id: string;
     author: string;
     date: string;
     rating: number; // 1-5 stars
     content: string;
     verified: boolean; // Verified purchase badge
   }

   const ProductReviews = ({ productId }: { productId: number }) => {
     const { data } = useQuery(GET_PRODUCT_REVIEWS, {
       variables: { productId },
     });

     return (
       <section>
         <h2>Customer Reviews ({data.reviews.length})</h2>
         <div className="flex items-center gap-2">
           <StarRating rating={data.averageRating} />
           <span>{data.averageRating} out of 5</span>
         </div>

         {data.reviews.map(review => (
           <ReviewCard key={review.id} review={review} />
         ))}
       </section>
     );
   };
   ```

3. **Add GraphQL queries for reviews**

   ```graphql
   # src/utils/gql/GQL_QUERIES.ts
   export const GET_PRODUCT_REVIEWS = gql`
     query GetProductReviews($productId: Int!) {
       product(id: $productId, idType: DATABASE_ID) {
         reviews {
           nodes {
             id
             author { node { name } }
             date
             rating
             content
             verified
           }
           averageRating
         }
       }
     }
   `;
   ```

4. **Create review submission form**
   - Show form only to logged-in users with verified purchases
   - Fields: Rating (1-5 stars), Title, Review text, Photos (optional)
   - Submit via WooCommerce REST API or GraphQL mutation
   - Show success message: "Thank you! Your review is pending approval."

5. **Display reviews on product page**
   - Sort by: Most recent, Highest rating, Most helpful
   - Pagination (10 reviews per page)
   - "Verified Purchase" badge for authenticated buyers
   - Review helpful voting (thumbs up/down)

**Acceptance Criteria:**

- [ ] Reviews visible on product pages
- [ ] Customers can submit reviews via form
- [ ] Average rating displayed prominently (next to price)
- [ ] Only verified buyers can review
- [ ] Reviews moderated (if enabled in WooCommerce)

**Estimated Effort:** 20-24 hours

---

#### **EPIC 3.C: SEO & Product Page Optimization**

**Priority:** P2 (Medium)  
**Duration:** 2 days  
**Owner:** Frontend Dev  
**Dependencies:** None

**User Story:**

> As a marketing manager, I need product pages optimized for search engines so organic traffic increases.

**Tasks:**

1. **Add structured data (JSON-LD)**

   ```typescript
   // src/components/Product/ProductSchema.component.tsx
   const ProductSchema = ({ product }: { product: Product }) => {
     const schema = {
       '@context': 'https://schema.org/',
       '@type': 'Product',
       name: product.name,
       image: product.image.sourceUrl,
       description: product.description,
       sku: product.sku,
       offers: {
         '@type': 'Offer',
         url: `https://mebl.com/product/${product.slug}`,
         priceCurrency: 'PLN',
         price: product.price,
         availability: 'https://schema.org/InStock',
       },
       aggregateRating: {
         '@type': 'AggregateRating',
         ratingValue: product.averageRating,
         reviewCount: product.reviewCount,
       },
     };

     return (
       <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
       />
     );
   };
   ```

2. **Optimize meta tags**

   ```typescript
   // src/pages/product/[slug].tsx
   <Head>
     <title>{product.name} | Custom 3D Furniture | Mebl</title>
     <meta
       name="description"
       content={`Customize your ${product.name} with our 3D configurator. Choose dimensions, colors, and materials. Starting from ${product.price} PLN.`}
     />
     <meta property="og:title" content={product.name} />
     <meta property="og:image" content={product.image.sourceUrl} />
     <meta property="og:type" content="product" />
   </Head>
   ```

3. **Optimize images**
   - Use Next.js `<Image>` component with `priority` for hero images
   - Generate `srcset` for responsive images
   - Add descriptive `alt` text: "Modern bar cabinet in brown oak, 120cm wide"
   - Serve WebP format with fallback

4. **Improve page speed**
   - Preload critical assets (3D model, hero image)
   - Defer non-critical scripts (GA4, chat widget)
   - Minify CSS and JS
   - Enable HTTP/2 server push

**Acceptance Criteria:**

- [ ] Google Rich Results Test validates structured data
- [ ] Lighthouse SEO score >95
- [ ] Meta tags include product price, availability, ratings
- [ ] Images have descriptive alt text
- [ ] Page loads in <2s on desktop, <3s on mobile

**Estimated Effort:** 12-16 hours

---

### 📊 **Phase 3 Milestone: Week 7 Demo**

**Deliverables:**

- ✅ GA4 tracking all user interactions and conversions
- ✅ Customer reviews visible on product pages
- ✅ SEO optimized with structured data
- ✅ Performance benchmarks meet targets

**Success Metrics:**

- GA4 e-commerce funnel shows <5% drop-off per step
- Average configurator engagement time >60 seconds
- Lighthouse SEO score >95
- Customer reviews enabled (at least 5 sample reviews)

---

## Phase 4: Customer Delight (Weeks 8-9)

**Goal:** Polish the experience and add "wow" features

### 🟡 **TRACK C: Advanced Features**

#### **EPIC 4.A: Customer Account Enhancements**

**Priority:** P2 (Medium)  
**Duration:** 3-4 days  
**Owner:** Full-stack Dev  
**Dependencies:** EPIC 2.C (orders exist)

**User Story:**

> As a returning customer, I want to view my past orders and re-order or modify my previous furniture configurations.

**Tasks:**

1. **Enhance order history page**
   - Already exists: `src/components/User/CustomerAccount.component.tsx`
   - Add configuration preview thumbnail for each order
   - Show dimensions and colors: "Cabinet (120×150×45 cm, Brown Oak)"
   - Add "Re-order" button (add same config to cart)
   - Add "Edit & Re-order" button (load config in configurator, allow changes)

2. **Create order detail page**

   ```typescript
   // src/pages/order/[id].tsx
   const OrderDetail = () => {
     const { id } = useRouter().query;
     const { data } = useQuery(GET_ORDER, { variables: { id } });

     return (
       <Layout title="Order Details">
         <h1>Order #{data.order.orderNumber}</h1>
         <p>Status: {data.order.status}</p>
         <p>Date: {data.order.date}</p>

         {/* Configuration Preview */}
         <ConfigurationPreview config={data.order.configurationJson} />

         {/* Actions */}
         <Button onClick={reorder}>Re-order</Button>
         <Button onClick={downloadPDF}>Download Configuration PDF</Button>
       </Layout>
     );
   };
   ```

3. **Implement configuration restoration**

   ```typescript
   // src/utils/configurator.ts
   export const restoreConfiguration = (
     serialized: SerializedConfiguration,
   ) => {
     configuratorState.dimensions = serialized.dimensions;
     configuratorState.items = serialized.colors;
     configuratorState.interactiveStates = serialized.interactiveStates;
   };
   ```

4. **Add "My Saved Configurations" feature**
   - Allow users to save configurations without purchasing
   - Store in WooCommerce user meta or separate table
   - Show list of saved configs on account page
   - Add "Load Configuration" button in configurator

**Acceptance Criteria:**

- [ ] Order history shows configuration thumbnails
- [ ] "Re-order" adds exact same config to cart
- [ ] "Edit & Re-order" loads config in configurator
- [ ] Users can save configurations for later
- [ ] Account page shows saved configurations list

**Estimated Effort:** 20-24 hours

---

#### **EPIC 4.B: Configuration Sharing & PDF Export**

**Priority:** P3 (Nice-to-have)  
**Duration:** 2-3 days  
**Owner:** Frontend Dev  
**Dependencies:** None

**User Story:**

> As a customer, I want to share my furniture configuration with family or download it as a PDF so I can get feedback before purchasing.

**Tasks:**

1. **Generate shareable link**

   ```typescript
   // src/utils/sharing.ts
   export const generateShareLink = (
     config: SerializedConfiguration,
   ): string => {
     const encoded = btoa(JSON.stringify(config)); // Base64 encode
     return `https://mebl.com/product/${config.modelId}?config=${encoded}`;
   };

   // Load from URL parameter
   const { config } = useRouter().query;
   if (config) {
     const decoded = JSON.parse(atob(config));
     restoreConfiguration(decoded);
   }
   ```

2. **Add share buttons in configurator**
   - Copy link to clipboard
   - Share via WhatsApp: `whatsapp://send?text=Check out my custom furniture: ${shareLink}`
   - Share via email: `mailto:?subject=My Custom Furniture&body=${shareLink}`

3. **Generate PDF with configuration details**
   - Use library: [jsPDF](https://github.com/parallax/jsPDF)
   - Include: 3D screenshot, dimensions, colors, price breakdown, QR code (to share link)
   - Template design: Professional A4 layout with branding

4. **Add PDF download button**
   ```typescript
   // src/components/Configurator/EnhancedControls.component.tsx
   <Button onClick={downloadPDF}>
     <Download className="mr-2" />
     Download Configuration PDF
   </Button>
   ```

**Acceptance Criteria:**

- [ ] Share link loads exact configuration in configurator
- [ ] PDF includes screenshot, dimensions, colors, price
- [ ] Share buttons work on mobile (native share sheet)
- [ ] PDF opens in new tab / downloads automatically

**Estimated Effort:** 16-20 hours

---

#### **EPIC 4.C: Live Chat Support (Optional)**

**Priority:** P3 (Nice-to-have)  
**Duration:** 1 day  
**Owner:** Frontend Dev  
**Dependencies:** Chat provider account (Intercom, Tawk.to, or Tidio)

**User Story:**

> As a customer, I want to ask questions about customization options so I feel confident purchasing.

**Tasks:**

1. **Choose chat provider**
   - Free options: Tawk.to, Tidio (free tier)
   - Paid options: Intercom, Drift, Zendesk Chat

2. **Install chat widget**

   ```typescript
   // src/pages/_app.tsx
   <Script id="tawk-to">
     {`
       var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
       (function(){
         var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
         s1.async=true;
         s1.src='https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}';
         s1.charset='UTF-8';
         s1.setAttribute('crossorigin','*');
         s0.parentNode.insertBefore(s1,s0);
       })();
     `}
   </Script>
   ```

3. **Configure chat triggers**
   - Show chat after 30s on product page
   - Show proactive message: "Need help customizing? Chat with us!"
   - Only show during business hours (9 AM - 6 PM)

4. **Train support team**
   - Prepare FAQ responses about configurator
   - How to help customers with dimension constraints
   - How to troubleshoot 3D model loading issues

**Acceptance Criteria:**

- [ ] Chat widget visible on product pages
- [ ] Proactive message appears after 30s
- [ ] Chat history saved for returning customers
- [ ] Mobile-friendly chat interface

**Estimated Effort:** 6-8 hours

---

### 📊 **Phase 4 Milestone: Week 9 Demo**

**Deliverables:**

- ✅ Order history with configuration previews
- ✅ Re-order and edit past configurations
- ✅ Share configurations via link
- ✅ Download configuration as PDF
- ✅ Live chat support (optional)

**Success Metrics:**

- > 10% of customers re-order from account page
- > 5% of customers share configurations
- Average chat response time <2 minutes

---

## Phase 5: Launch Readiness (Week 10)

**Goal:** Final QA, launch prep, and go-live

### 🔴 **TRACK A: Production Deployment**

#### **EPIC 5.A: Final QA & Bug Fixes**

**Priority:** P0 (Critical)  
**Duration:** 3-4 days  
**Owner:** QA Team + All Devs

**Tasks:**

1. **Cross-browser testing**
   - Chrome, Firefox, Safari (desktop + mobile)
   - Edge, Samsung Internet
   - Test on real devices (iPhone 13, Samsung Galaxy S21)

2. **Accessibility audit**
   - Screen reader testing (NVDA, VoiceOver)
   - Keyboard navigation (Tab, Enter, Esc)
   - Color contrast check (WCAG AA)
   - ARIA labels on interactive elements

3. **Performance testing**
   - Load test checkout with 100 concurrent users
   - Stress test 3D model rendering on low-end devices
   - Test with throttled network (Slow 3G)

4. **Security audit**
   - OWASP Top 10 vulnerability scan
   - Test payment gateway for injection attacks
   - Verify HTTPS everywhere
   - Check for exposed API keys in frontend

5. **Bug bash session**
   - All team members test app for 2 hours
   - Document all bugs in GitHub Issues
   - Prioritize: P0 (blocking), P1 (high), P2 (medium), P3 (low)
   - Fix P0 and P1 bugs before launch

**Acceptance Criteria:**

- [ ] Zero P0 bugs remaining
- [ ] <5 P1 bugs remaining (with mitigation plans)
- [ ] Lighthouse scores: Performance >85, Accessibility >90, SEO >95
- [ ] WCAG AA compliance verified
- [ ] Payment gateway passes security audit

**Estimated Effort:** 24-32 hours (team effort)

---

#### **EPIC 5.B: Launch Preparation**

**Priority:** P0 (Critical)  
**Duration:** 2 days  
**Owner:** DevOps + Product Owner

**Tasks:**

1. **Set up production environment**
   - Production WordPress on stable hosting
   - Production Next.js on Render.com (or custom domain)
   - Configure CDN (Cloudflare) for static assets
   - Set up SSL certificates

2. **Configure monitoring & alerts**
   - Sentry for error tracking (frontend + backend)
   - UptimeRobot for uptime monitoring
   - LogRocket for session replay (premium tier)
   - Slack alerts for critical errors

3. **Prepare launch checklist**
   - [ ] DNS configured and propagated
   - [ ] Environment variables set in production
   - [ ] Database backup taken
   - [ ] Rollback plan documented
   - [ ] Support team trained
   - [ ] Customer FAQ published
   - [ ] Social media announcement ready
   - [ ] Press release drafted (optional)

4. **Performance baseline**
   - Document current metrics (before launch)
   - Set targets for Week 1: >100 orders, >1000 configurator interactions
   - Set SLA targets: 99.9% uptime, <2s page load

5. **Post-launch support plan**
   - 24/7 on-call rotation for Week 1
   - Daily stand-ups to review issues
   - Hotfix deployment process defined

**Acceptance Criteria:**

- [ ] Production environment stable and tested
- [ ] Monitoring alerts working (test by triggering errors)
- [ ] Launch checklist 100% complete
- [ ] Rollback plan tested in staging

**Estimated Effort:** 16-20 hours

---

#### **EPIC 5.C: Launch & Iteration**

**Priority:** P0 (Critical)  
**Duration:** 1 day (launch) + ongoing

**Tasks:**

1. **Soft launch (Day 1)**
   - Enable production for limited audience (beta users, internal team)
   - Monitor for errors and performance issues
   - Fix critical bugs within 4 hours

2. **Public launch (Day 2)**
   - Announce on social media, email newsletter
   - Enable for all users
   - Monitor analytics: Traffic spikes, conversion rates, errors

3. **Daily health checks (Week 1)**
   - Review GA4 dashboards: Traffic, conversions, drop-offs
   - Check Sentry for errors (triage and fix)
   - Read customer feedback (chat, reviews, support tickets)

4. **Week 1 retrospective**
   - What went well? What didn't?
   - Identify top 3 pain points from customers
   - Plan iteration roadmap (post-POC improvements)

**Acceptance Criteria:**

- [ ] Zero critical errors during launch
- [ ] > 90% uptime in Week 1
- [ ] > 100 orders completed
- [ ] Customer feedback collected and documented

**Estimated Effort:** Ongoing

---

### 📊 **Phase 5 Milestone: Launch Complete!**

**Deliverables:**

- ✅ Production environment live and stable
- ✅ All P0 and P1 bugs fixed
- ✅ Monitoring and alerts configured
- ✅ Public launch successful with positive feedback

**Success Metrics:**

- > 100 orders in first week
- > 1000 configurator interactions
- <1% checkout abandonment due to technical errors
- Lighthouse Performance >85, Accessibility >90

---

## Risk Assessment & Mitigation

### Critical Risks (P0)

| Risk                                  | Impact                                        | Probability | Mitigation                                                               |
| ------------------------------------- | --------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| **WooCommerce setup delayed**         | Blocks Tracks C, pushes timeline by 1-2 weeks | Medium      | Start Track B work immediately, use mocks, set hard deadline for Track A |
| **Przelewy24 integration issues**     | Can't accept payments, POC fails              | Medium      | Test in sandbox early, have backup plan (COD only launch)                |
| **3D models too large, slow loading** | Poor UX, high bounce rate                     | Low         | Compress models to <500KB, use loading skeleton, test on 3G              |
| **Apollo GraphQL CORS errors**        | Frontend can't connect to WooCommerce         | Low         | Use WPGraphQL CORS plugin, whitelist domains, test in staging            |
| **Configurator state not saving**     | Users lose work, frustration                  | Medium      | Implement persistence early (Week 1), add auto-save notifications        |

### High Risks (P1)

| Risk                              | Impact                         | Probability | Mitigation                                                           |
| --------------------------------- | ------------------------------ | ----------- | -------------------------------------------------------------------- |
| **Dynamic pricing formula wrong** | Incorrect prices, revenue loss | Medium      | Unit tests, manual QA, add admin override                            |
| **Mobile touch gestures buggy**   | Poor mobile UX, lost sales     | Medium      | Test on real devices early, use proven libraries (@react-three/drei) |
| **Payment webhook delays**        | Orders stuck in "pending"      | Low         | Implement retry logic, manual order confirmation fallback            |
| **SEO not working**               | Low organic traffic            | Low         | Validate structured data with Google tools, submit sitemap           |

---

## Team Structure & Roles

### Track A: Backend Foundation

- **1 DevOps Engineer** — WordPress hosting, deployment, monitoring
- **1 Backend Developer** — WooCommerce plugins, GraphQL schema, payment integration

### Track B: Frontend Optimization

- **2 Frontend Developers** — Configurator state, pricing, mobile UX, performance

### Track C: Integration

- **1 Full-stack Developer** — Cart integration, checkout, analytics, reviews

### Supporting Roles

- **1 Product Owner** — Prioritization, stakeholder communication, acceptance criteria
- **1 QA Engineer** — Test plans, cross-browser testing, accessibility audit
- **1 Designer** — UI/UX improvements, PDF template, error states

**Total Team Size:** 7 people  
**Total Duration:** 10 weeks (with parallel tracks)

---

## Success Criteria for POC

### Technical Metrics

- ✅ **Lighthouse Performance:** >85 (desktop), >75 (mobile)
- ✅ **Lighthouse Accessibility:** >90
- ✅ **Lighthouse SEO:** >95
- ✅ **Uptime:** >99.5% (measured over 30 days)
- ✅ **Page Load Time:** <2s (desktop), <3s (mobile)
- ✅ **Time to Interactive:** <4s
- ✅ **Error Rate:** <0.1% (Sentry)

### Business Metrics

- ✅ **Orders:** >100 in first month
- ✅ **Conversion Rate:** >2% (configurator view → purchase)
- ✅ **Average Order Value:** >2500 PLN
- ✅ **Cart Abandonment:** <70%
- ✅ **Customer Reviews:** >20 reviews, avg >4 stars
- ✅ **Repeat Purchase Rate:** >10% within 90 days

### User Experience Metrics

- ✅ **Configurator Engagement:** >60s average time
- ✅ **Configuration Completion:** >50% (users who change dimensions/colors)
- ✅ **Mobile Traffic:** >40% of total traffic
- ✅ **Mobile Conversion Rate:** >1.5%
- ✅ **Customer Satisfaction:** >4/5 (post-purchase survey)

---

## Post-POC Roadmap (Phase 6+)

### Quarter 2 Improvements

- **Advanced Materials:** Add wood textures, metal finishes (PBR materials)
- **AR Preview:** View furniture in your room (WebXR or ARKit)
- **Multi-currency:** Support EUR, USD, GBP
- **Localization:** Translate to English, German
- **B2B Portal:** Bulk orders, custom pricing for interior designers
- **CRM Integration:** Sync orders with Salesforce/HubSpot

### Quarter 3 Features

- **AI Design Assistant:** "I want a modern cabinet for my living room" → Auto-configure
- **3D Room Planner:** Place multiple furniture items in a room layout
- **Subscription Model:** Rent furniture with option to buy
- **Social Proof:** Show "125 customers configured this today"
- **Wishlist & Favorites:** Save multiple configurations

---

## Appendix: Technology Stack

### Frontend

- **Framework:** Next.js 15.5.6 (Pages Router)
- **React:** 18.3.1
- **TypeScript:** 5.x (ES2022 target)
- **3D Rendering:** React Three Fiber 8.17.10, Three.js, @react-three/drei 9.114.3
- **State Management:** Zustand 5.0.8 (cart), Valtio 2.1.2 (configurator)
- **Styling:** Tailwind CSS 3.x
- **UI Components:** Radix UI, Shadcn UI
- **Forms:** React Hook Form, Zod validation

### Backend

- **E-commerce:** WooCommerce 9.9+
- **CMS:** WordPress 6.8+
- **API:** WPGraphQL 2.3+, WooGraphQL 0.19+
- **Database:** MySQL 8.0+
- **Payment:** Przelewy24 WooCommerce Plugin

### Infrastructure

- **Hosting (Frontend):** Render.com (Docker container)
- **Hosting (Backend):** TBD (Kinsta/WP Engine recommended)
- **CDN:** Cloudflare
- **Monitoring:** Sentry (errors), UptimeRobot (uptime), GA4 (analytics)

### Developer Tools

- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions (Lighthouse CI, Playwright tests)
- **Testing:** Playwright (E2E), Jest (unit tests)
- **Code Quality:** ESLint, Prettier, Husky (pre-commit hooks)

---

## Appendix: E-commerce Readiness Checklist Status

Based on industry best practices, here's how the POC addresses the standard e-commerce checklist:

### Product Page Optimization

- ✅ **High-quality images:** 3D configurator (better than static images)
- ✅ **Zoom functionality:** Three.js orbit controls
- ✅ **Detailed descriptions:** Product info component
- ✅ **Clear pricing:** Dynamic pricing with breakdown
- ⚠️ **Stock availability:** Not implemented (always "in stock" for custom furniture)
- ✅ **Related products:** WooCommerce upsells (existing)
- ✅ **Social sharing:** Phase 4 (share configuration)

### Payment Gateway Integration

- ✅ **Secure processing:** Przelewy24 (PCI compliant)
- ✅ **Test transactions:** Sandbox mode in Phase 2
- ✅ **Multiple payment options:** Credit card, bank transfer, BLIK
- ✅ **Clear error messages:** Form validation + error states
- ✅ **Confirmation emails:** WooCommerce default emails

### Shopping Cart Functionality

- ✅ **Add/remove items:** Zustand store with persistence
- ✅ **Auto-update:** Real-time cart sync
- ✅ **Cart visibility:** Cart icon in header
- ✅ **View without leaving page:** Slide-out cart drawer
- ✅ **Cart summary:** Subtotal, shipping, tax, total
- ⚠️ **Save items/wishlist:** Phase 4 (saved configurations)
- ⚠️ **Guest checkout:** Existing (optional account creation)

### Shipping & Return Policy

- ✅ **Shipping options:** Flat rate, free shipping, pickup
- ✅ **Clear costs:** Displayed before checkout
- ✅ **Delivery estimates:** "3-4 weeks" (custom furniture)
- ⚠️ **Return policy:** TBD (link to static page needed)
- ⚠️ **Return instructions:** TBD (FAQ page needed)

### Customer Reviews

- ✅ **Review functionality:** Phase 3 (WooCommerce reviews)
- ✅ **Easy submission:** Review form on product page
- ✅ **Moderation:** WooCommerce settings
- ⚠️ **Customer responses:** Not implemented
- ✅ **Aggregate ratings:** Displayed with stars
- ⚠️ **Review incentives:** Not implemented

### Site-wide Optimization

- ✅ **Easy navigation:** Clear categories, Algolia search
- ✅ **Responsive design:** Mobile-first approach
- ✅ **Performance:** Lighthouse CI in Phase 1
- ✅ **Analytics:** GA4 in Phase 3
- ✅ **Customer contact:** Contact form (existing)
- ⚠️ **Chatbot:** Phase 4 (optional)

### Marketing & Recovery

- ⚠️ **Re-targeting ads:** Not in POC scope
- ⚠️ **Ad campaigns:** Not in POC scope
- ⚠️ **Cart abandonment emails:** Not implemented (future)
- ⚠️ **Welcome emails:** WooCommerce default (minimal)
- ⚠️ **Newsletters:** Not implemented
- ⚠️ **Social media:** Accounts TBD

### SEO Optimization

- ✅ **Meta tags:** Phase 3
- ✅ **Alt text:** All images
- ✅ **Keyword content:** Product descriptions
- ✅ **Custom 404:** Next.js default (could improve)

**Overall Readiness Score:** **75% Complete** (18/24 items)  
**POC Coverage:** **85% of critical items**

---

## Appendix: Glossary

- **3D Configurator:** Interactive tool for customizing furniture dimensions, colors, and materials in real-time 3D
- **Dynamic Pricing:** Price calculation that updates based on customer's dimension/material selections
- **Przelewy24:** Leading Polish payment gateway (supports credit cards, bank transfers, BLIK)
- **WPGraphQL:** WordPress plugin that exposes a GraphQL API
- **WooGraphQL:** Extension for WPGraphQL that adds WooCommerce data to the schema
- **Valtio:** Minimalist state management library (used for configurator)
- **Zustand:** Lightweight state management with persistence (used for cart)
- **React Three Fiber:** React renderer for Three.js (3D graphics library)
- **Lighthouse CI:** Automated performance/accessibility/SEO auditing tool
- **GA4:** Google Analytics 4 (latest analytics platform)
- **COD:** Cash on Delivery (pay when product arrives)

---

**Document Status:** ✅ Ready for Implementation  
**Next Steps:**

1. Review with stakeholders (1 hour meeting)
2. Finalize WooCommerce hosting decision (by end of day)
3. Create GitHub Issues for all Epics (Product Owner)
4. Assign Track A tasks to DevOps + Backend (Start Monday)
5. Assign Track B tasks to Frontend Team (Start Monday)
6. Schedule daily stand-ups (15 min, 9 AM)

**Questions?** Contact Product Owner or Tech Lead

---

**End of Document**
