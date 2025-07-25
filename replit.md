# Domain Redirector Application

## Overview

This is a full-stack web application for configuring domain redirects. It provides a simple UI to set up domains for redirection with customizable delays and auto-redirect options. The application uses a React frontend with TypeScript, an Express backend, and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **UI Components**: ShadCN UI component library with Radix UI primitives
- **Styling**: Tailwind CSS for styling with a custom theme configuration
- **State Management**: React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Framework**: Express.js with TypeScript
- **API**: RESTful API architecture for domain management
- **Database ORM**: Drizzle ORM for database operations
- **Database**: Designed for PostgreSQL (using Neon Database serverless connector)
- **Session Management**: Simple in-memory storage (to be replaced with database storage)

### Data Layer
- **Schema**: Defined using Drizzle ORM with Zod validation
- **Models**: Users and Domains with relationships
- **Validation**: Shared schemas between frontend and backend using Zod

## Key Components

### Frontend Components
1. **DomainForm**: Handles creation and editing of domain redirects
2. **StatusCard**: Displays the current redirect configuration
3. **RedirectNotice**: Shows a countdown and handles the actual redirection
4. **ThemeProvider**: Manages light/dark theme switching

### Backend Components
1. **API Routes**: RESTful endpoints for domain CRUD operations
2. **Storage Layer**: Interface for database operations (currently in-memory)
3. **Schema Validation**: Domain validation using shared Zod schemas

### Shared Components
1. **Schema Definitions**: Database schema shared between frontend and backend
2. **Validation Logic**: Zod schemas for data validation

## Data Flow

1. **User Input**:
   - User enters domain information in the DomainForm component
   - Form data is validated client-side using Zod

2. **API Communication**:
   - Validated data is sent to the API endpoints
   - Backend validates the data again using shared schemas
   - Data is stored in database (currently simulated with in-memory storage)

3. **Redirect Process**:
   - When redirects are configured, a timer starts based on the delay setting
   - After the delay, the user is redirected to the configured domain

## External Dependencies

### Frontend Dependencies
- **@radix-ui** components for UI primitives
- **shadcn/ui** component library (implemented directly in the codebase)
- **@tanstack/react-query** for data fetching and caching
- **react-hook-form** for form handling
- **zod** for schema validation
- **tailwindcss** for styling
- **lucide-react** for icons

### Backend Dependencies
- **express** for the web server
- **drizzle-orm** for database operations
- **@neondatabase/serverless** for PostgreSQL connection
- **zod** for schema validation

## Deployment Strategy

The application is configured for deployment on Replit:

1. **Development Mode**:
   - Uses Vite development server with HMR
   - Express API and Vite dev server run concurrently

2. **Production Build**:
   - Frontend is built with Vite (output to dist/public)
   - Backend is bundled with esbuild (output to dist/index.js)
   - Static assets are served by Express

3. **Database Migration**:
   - Drizzle ORM is used for schema migrations
   - Schema changes can be pushed using `npm run db:push`

4. **Environment Configuration**:
   - Requires DATABASE_URL environment variable for PostgreSQL connection
   - Different configurations for development and production environments

## Development Workflows

### Adding New Features
1. For new domain properties, update the schema in `shared/schema.ts`
2. Add corresponding UI elements in the React components
3. Update the API endpoints in `server/routes.ts`
4. Implement storage methods in `server/storage.ts`

### Database Changes
1. Modify the schema in `shared/schema.ts`
2. Run `npm run db:push` to update the database schema
3. Update the affected components to use the new schema

### UI Component Usage
1. Find relevant components in the `client/src/components/ui` directory
2. Components follow the shadcn/ui pattern with Radix UI primitives
3. Customize using Tailwind CSS classes and the theme configuration