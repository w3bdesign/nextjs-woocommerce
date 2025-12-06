---
description: 'ReactJS development standards and best practices'
applyTo: '**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss'
---

# ReactJS Development Instructions

Instructions for building high-quality ReactJS applications with modern patterns, hooks, and best practices following the official React documentation at https://react.dev.

## Project Context

- Latest React version (React 18+)
- TypeScript for type safety (strict mode enabled)
- Functional components with hooks as default
- **Built with Next.js using Pages Router** for routing and SSR
- Follow React's official style guide and best practices
- Tailwind CSS for utility-first styling
- Zustand for global state management
- Apollo Client for GraphQL data fetching
- Playwright for end-to-end testing

## Development Standards

### Architecture

- Use functional components with hooks as the primary pattern
- Implement component composition over inheritance
- Organize components by feature or domain for scalability
- Separate presentational and container components clearly
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow

### TypeScript Integration

- Use TypeScript interfaces for props, state, and component definitions
- Define proper types for event handlers and refs
- Implement generic components where appropriate
- Use strict mode in `tsconfig.json` for type safety
- Leverage React's built-in types (`React.FC`, `React.ComponentProps`, etc.)
- Create union types for component variants and states

### Component Design

- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions
- Implement proper prop validation with TypeScript or PropTypes
- Design components to be testable and reusable
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions)

### State Management

- Use `useState` for local component state
- Implement `useReducer` for complex state logic
- Leverage `useContext` for sharing state across component trees
- Use **Zustand** for global application state (preferred for this project)
- Implement proper state normalization and data structures
- Use Apollo Client for server state management (GraphQL queries/mutations)

### Hooks and Effects

- Use `useEffect` with proper dependency arrays to avoid infinite loops
- Implement cleanup functions in effects to prevent memory leaks
- Use `useMemo` and `useCallback` for performance optimization when needed
- Create custom hooks for reusable stateful logic
- Follow the rules of hooks (only call at the top level)
- Use `useRef` for accessing DOM elements and storing mutable values

### Styling

- Use **Tailwind CSS** for utility-first styling (primary approach for this project)
- Use CSS Modules or Tailwind for component-scoped styles when needed
- Implement responsive design with mobile-first approach
- Use Tailwind's `@apply` directive for custom components
- Use CSS custom properties (variables) for theming
- Implement consistent spacing, typography, and color systems
- Ensure accessibility with proper ARIA attributes and semantic HTML
- Use `tailwind-merge` to safely merge Tailwind classes without conflicts
- Use `class-variance-authority` for managing component variants
- Use `clsx` for conditional className composition

### UI Component Library (Radix UI + shadcn/ui)

- Build accessible component foundations using **Radix UI** primitives
- Use **shadcn/ui** components for pre-built, customizable UI elements
- Components are located in `src/components/ui/` and built on Radix UI
- Customize components using Tailwind CSS for styling
- Follow shadcn/ui patterns for component composition and props
- Leverage Radix UI's accessibility features (ARIA, keyboard navigation, focus management)
- When creating new UI components, use Radix UI primitives as the foundation
- Document component variants and available props clearly

### Icons

- Use **Lucide React** for all icon needs (`lucide-react` package)
- Import icons directly: `import { IconName } from 'lucide-react'`
- Use consistent icon sizing across the application
- Icons are composable and can be styled with Tailwind CSS
- For custom icons, create SVG components in `src/components/SVG/`

### Animation

- Use **Motion** library for smooth animations and transitions
- Use **tailwindcss-animate** for Tailwind-based animations
- Keep animations performant and avoid excessive DOM manipulation
- Use CSS animations for simple transitions (Tailwind or CSS modules)
- Consider performance impact of animations on older devices

### Performance Optimization

- Use `React.memo` for component memoization when appropriate
- Implement code splitting with `React.lazy` and `Suspense`
- Optimize bundle size with tree shaking and dynamic imports
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists
- Profile components with React DevTools to identify performance bottlenecks

### 3D Graphics & Configurator

- Use **Three.js** for 3D model rendering
- Use **@react-three/fiber** to integrate Three.js with React components
- Use **@react-three/drei** utilities for common 3D patterns (models, controls, lighting, etc.)
- Wrap 3D scenes with `Suspense` boundaries for proper loading states
- Optimize 3D models using GLB format and compression
- Use `preload` for 3D assets to improve performance
- Implement proper lighting, camera controls, and model positioning
- Handle interaction events (click, drag) on 3D objects
- Test 3D performance on low-end devices and optimize accordingly

### Data Fetching

- Use **Apollo Client** for server state management (GraphQL queries/mutations)
- Implement proper loading, error, and success states
- Handle race conditions and request cancellation
- Use optimistic updates for better user experience
- Implement proper caching strategies with Apollo's cache
- Handle offline scenarios and network errors gracefully

### Error Handling

- Implement Error Boundaries for component-level error handling
- Use proper error states in data fetching
- Implement fallback UI for error scenarios
- Log errors appropriately for debugging
- Handle async errors in effects and event handlers
- Provide meaningful error messages to users
- Catch errors in Suspense boundaries with proper fallback UI

### Forms and Validation

- Use controlled components for form inputs
- Implement form validation with **React Hook Form**
- Consider adding schema validation with libraries like `zod` or `yup`
- Handle form submission and error states appropriately
- Implement accessibility features for forms (labels, ARIA attributes)
- Use debounced validation for better user experience
- Handle file uploads and complex form scenarios

### Search & Discovery

- Use **Algolia** for product search and discovery
- Integrate with `algoliasearch` client library
- Use `react-instantsearch-dom` for pre-built search UI components
- Implement search filters, facets, and sorting
- Handle search indexing and synchronization with the product database
- Optimize search performance with proper query debouncing
- Provide autocomplete and suggestions for better UX
- Test search relevance and ranking with actual product data

### Routing

- Use Next.js Pages Router for file-based routing (pages in `src/pages/`)
- Dynamic routes: Use `[param].tsx` for route parameters (e.g., `pages/product/[slug].tsx`)
- Route protection: Implement with HOCs like `withAuth` for authenticated routes
- Query strings: Access via `router.query` or URL parameters
- Implement lazy loading for route-based code splitting using `React.lazy` and `Suspense`
- Use `next/link` for client-side navigation and `next/router` for programmatic navigation
- Implement proper loading states and error handling for page transitions

### Testing

- Write unit tests for components using React Testing Library and Jest
- Test component behavior, not implementation details
- Use Jest for test runner and assertion library
- Implement integration and end-to-end tests with Playwright
- Mock external dependencies and API calls appropriately
- Test accessibility features and keyboard navigation

### Security

- Sanitize user inputs to prevent XSS attacks
- Validate and escape data before rendering
- Use HTTPS for all external API calls
- Implement proper authentication and authorization patterns
- Avoid storing sensitive data in localStorage or sessionStorage
- Use Content Security Policy (CSP) headers

### Accessibility

- Use semantic HTML elements appropriately
- Implement proper ARIA attributes and roles
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for images and descriptive text for icons
- Implement proper color contrast ratios
- Test with screen readers and accessibility tools

### Git Hooks & Pre-commit Linting

- Use **Husky** to configure git hooks for pre-commit linting
- Use **lint-staged** to run linters only on staged files
- Run ESLint and Prettier on staged TypeScript/JavaScript files
- Run Prettier on staged JSON, Markdown, and CSS files
- Ensure code quality and formatting compliance before commits
- Configure `.husky/` directory for hook definitions
- Update `.lint-staggedrc` or `package.json` for lint-staged configuration

## Implementation Process

1. Plan component architecture and data flow
2. Set up project structure with proper folder organization
3. Define TypeScript interfaces and types
4. Implement core components with proper styling
5. Add state management and data fetching logic
6. Implement routing and navigation
7. Add form handling and validation
8. Implement error handling and loading states
9. Add testing coverage for components and functionality
10. Optimize performance and bundle size
11. Ensure accessibility compliance
12. Add documentation and code comments

## Additional Guidelines

- Follow React's naming conventions (PascalCase for components, camelCase for functions)
- Use meaningful commit messages and maintain clean git history
- Implement proper code splitting and lazy loading strategies
- Document complex components and custom hooks with JSDoc
- Use ESLint and Prettier for consistent code formatting
- Keep dependencies up to date and audit for security vulnerabilities
- Implement proper environment configuration for different deployment stages
- Use React Developer Tools for debugging and performance analysis

## Common Patterns

- Higher-Order Components (HOCs) for cross-cutting concerns
- Render props pattern for component composition
- Compound components for related functionality
- Provider pattern for context-based state sharing
- Container/Presentational component separation
- Custom hooks for reusable logic extraction
