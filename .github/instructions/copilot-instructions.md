# ModularCraft Development Guide

## File Creation Policy

**RULE:** Do not generate or create summary, status, or temporary documentation files unless the user specifically asks for them.

- Do NOT create files named with patterns like `*_SUMMARY.md`, `*_STATUS.md`, `*_FIX.md`
- Do NOT create documentation files for completed tasks unless requested
- Do NOT create temporary status tracking files
- Only create code files or update existing documentation if the user requests it
- If a summary is needed, provide it in the chat response, not as a file

## Architecture Overview

ModularCraft is a D2C e-commerce platform for customizable furniture with 3D configuration. The system follows a **proxy architecture pattern** using a **Turborepo monorepo** where NestJS API orchestrates between Angular frontend and multiple services.

### Monorepo Structure

```
modularcraft/                # Turborepo workspace
├── apps/
│   ├── frontend/            # Angular 20+ SSR (Render deployment platform) ✅
│   └── api/                 # NestJS API (Render deployment platform) ⏳ TODO
├── packages/
│   ├── shared/              # TypeScript types, utils, constants ✅
│   ├── services/            # WooCommerce, Zakeke, Stripe wrappers ⏳ TODO
│   └── ui/                  # Shared Angular components ⏳ TODO
├── tools/                   # Dev/deploy scripts, migrations ⏳ TODO
├── turbo.json              # Turborepo pipeline config ✅
└── package.json            # Yarn workspaces ✅
```

### Core Components

- **Angular 20+ (Zoneless)** - Frontend with zoneless change detection, SSR enabled (Render deployment platform)
- **NestJS API** - Backend proxy and business logic (Render deployment platform)
- **WooCommerce** - Product catalog and order management (home.pl)
- **Zakeke SaaS** - 3D furniture configurator (iframe integration)
- **Stripe** - Payment processing
- **PostgreSQL** - Relational database (Supabase)
- **Redis** - Caching and session storage (Render)
- **Turborepo** - Monorepo management and build orchestration

## Running anything in terminal / testing changes

- If you want to test something: run server in one terminal and commands that test in separate terminal.
- Before trying to run another server check if there is already one running. Don't spawn servers without checking first.
