# Overview

This is a Florida Building Permit Package Manager - a comprehensive web application designed to streamline the construction permit process across all 67 Florida counties. The system provides document management, county-specific checklists, and workflow tracking for building permit applications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:** React with TypeScript, Vite for build tooling, and Wouter for client-side routing.

**UI Framework:** Uses Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The design system follows a consistent pattern with reusable components like cards, forms, buttons, and navigation elements.

**State Management:** TanStack Query (React Query) handles all server state management, API caching, and data fetching. No additional state management library is used, relying on React's built-in state for local component state.

**File Upload:** Uppy library integrated for file upload functionality with support for AWS S3 direct uploads via presigned URLs.

## Backend Architecture

**Framework:** Express.js server with TypeScript, following a modular route-based architecture.

**Database Layer:** Drizzle ORM with PostgreSQL (specifically Neon Database) for data persistence. Database migrations are managed through Drizzle Kit.

**Authentication:** Replit's OIDC-based authentication system with session management using PostgreSQL session storage.

**API Design:** RESTful API structure with dedicated routes for:
- User management and authentication
- Permit package CRUD operations
- Document management with file uploads
- County-specific checklist management
- Object storage operations

## Data Storage Solutions

**Primary Database:** PostgreSQL via Neon Database for structured data including users, counties, permit packages, documents, and checklist items.

**File Storage:** Google Cloud Storage for document and file storage with custom ACL (Access Control List) system for permission management.

**Session Storage:** PostgreSQL-based session management for user authentication state.

## Authentication and Authorization

**Authentication Method:** Replit's OIDC provider integration with Passport.js strategy implementation.

**Session Management:** Express sessions stored in PostgreSQL with configurable TTL and secure cookie settings.

**Authorization:** Custom object-level permissions system using ACL policies stored as metadata on Google Cloud Storage objects.

## External Dependencies

**Cloud Services:**
- Neon Database (PostgreSQL hosting)
- Google Cloud Storage (file storage)
- Replit OIDC (authentication provider)

**Key Libraries:**
- Drizzle ORM for database operations
- TanStack Query for API state management
- Shadcn/ui + Radix UI for component library
- Uppy for file upload functionality
- Passport.js for authentication strategies
- Express.js for server framework

**Development Tools:**
- Vite for frontend build and development
- TypeScript for type safety
- Tailwind CSS for styling
- ESBuild for server bundling