---
applyTo: '**'
---

## 1. Project Structure & Organization

This project uses the **Pages Router** architecture. Maintain this structure for consistency.

- **Top-level folders:**
  - `pages/` — File-based routing (each file = a route)
  - `public/` — Static assets (images, fonts, etc.)
  - `lib/` — Shared utilities, API clients, and logic
  - `components/` — Reusable UI components (organized by feature)
  - `contexts/` — React context providers
  - `styles/` — Global and modular stylesheets
  - `hooks/` — Custom React hooks
  - `types/` — TypeScript type definitions
  - `stores/` — State management (Zustand, etc.)
  - `utils/` — Utility functions and helpers
  - `config/` — Configuration files (e.g., model configs, site settings)
  - `tests/` — Test files co-located or organized by feature
- **Pages Organization:**
  - Each file in `pages/` corresponds to a route (e.g., `pages/products.tsx` → `/products`)
  - Use `[param].tsx` for dynamic routes (e.g., `pages/product/[id].tsx` → `/product/:id`)
  - Special files: `_app.tsx` (App wrapper), `_document.tsx` (HTML document), `_error.tsx` (error page)
- **Component Organization:**
  - Group components by feature inside `components/` (e.g., `components/Configurator/`, `components/Cart/`)
  - Use the `.component.tsx` suffix to clearly identify component files
  - Co-locate styles and tests with components when appropriate
- **Use `src/`:** All source code is organized in `src/` to separate from config files at the root.

## 2. Component Best Practices

- **Component Types:**
  - **Pages Components:** Exported as default from `pages/*.tsx` files. Handle page-level logic and routing.
  - **Reusable Components:** Stored in `components/` for use across multiple pages.
  - **Client-side Interactivity:** Use React hooks directly (no `'use client'` directive needed in Pages Router).
- **When to Create a Component:**
  - If a UI pattern is reused more than once.
  - If a section of a page is complex or self-contained.
  - If it improves readability or testability.
- **Naming Conventions:**
  - Use `PascalCase` for component files and exports (e.g., `UserCard.component.tsx`).
  - Use the `.component.tsx` suffix to clearly identify component files.
  - Use `camelCase` for hooks (e.g., `useUser.ts`).
  - Use `snake_case` or `kebab-case` for static assets (e.g., `logo_dark.svg`).
- **File Naming:**
  - Match the component name to the file name.
  - Use the `.component.tsx` suffix for components (e.g., `Hero.component.tsx`).
  - For single-export files, default export the component.
  - For multiple related components, use an `index.ts` barrel file.
- **Component Location:**
  - Place shared components in `components/`.
  - Place route-specific components inside the relevant route folder.
- **Props:**
  - Use TypeScript interfaces for props.
  - Prefer explicit prop types and default values.
- **Testing:**
  - Co-locate tests with components (e.g., `UserCard.test.tsx`).

## 3. Naming Conventions (General)

- **Folders:** `kebab-case` (e.g., `user-profile/`)
- **Files:** `PascalCase` for components, `camelCase` for utilities/hooks, `kebab-case` for static assets
- **Variables/Functions:** `camelCase`
- **Types/Interfaces:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`

## 4. API Routes

- **Prefer API Routes over external services** when simple endpoints are needed.
- **Location:** Place API routes in `pages/api/` (e.g., `pages/api/users.ts`).
- **HTTP Methods:** Use the `req.method` property to handle different HTTP verbs (`GET`, `POST`, etc.).
- **Request/Response:** Use Node.js `Request` and `Response` APIs via `req` and `res` objects.
- **Dynamic Segments:** Use `[param].ts` for dynamic API routes (e.g., `pages/api/users/[id].ts`).
- **Validation:** Always validate and sanitize input. Use libraries like `zod` or `yup`.
- **Error Handling:** Return appropriate HTTP status codes and error messages via `res.status()`.
- **Authentication:** Protect sensitive routes using middleware or server-side session checks (e.g., cookies).

**Example:**

```tsx
// pages/api/users/[id].ts
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Handle GET
    res.status(200).json({ id, name: 'User' });
  } else if (req.method === 'POST') {
    // Handle POST
    res.status(201).json({ message: 'Created' });
  } else {
    res.status(405).end('Method Not Allowed');
  }
}
```

## 5. General Best Practices

- **TypeScript:** Use TypeScript for all code. Enable `strict` mode in `tsconfig.json`.
- **ESLint & Prettier:** Enforce code style and linting. Use the official Next.js ESLint config.
- **Environment Variables:** Store secrets in `.env.local`. Never commit secrets to version control.
- **Testing:** Use Jest, React Testing Library, or Playwright. Write tests for all critical logic and components.
- **Accessibility:** Use semantic HTML and ARIA attributes. Test with screen readers.
- **Performance:**
  - Use built-in Image and Font optimization.
  - Use `next/dynamic` for code splitting (lazy-load components).
  - Minimize bundle size; lazy-load heavy dependencies where possible.
- **Security:**
  - Sanitize all user input.
  - Use HTTPS in production.
  - Set secure HTTP headers.
- **Documentation:**
  - Write clear README and code comments.
  - Document public APIs and components.

# Avoid Unnecessary Example Files

Do not create example/demo files (like ModalExample.tsx) in the main codebase unless the user specifically requests a live example, Storybook story, or explicit documentation component. Keep the repository clean and production-focused by default.

# Always use the latest documentation and guides

- For every nextjs related request, begin by searching for the most current nextjs documentation, guides, and examples.
- Use the following tools to fetch and search documentation if they are available:
  - `resolve_library_id` to resolve the package/library name in the docs.
  - `get_library_docs` for up to date documentation.
