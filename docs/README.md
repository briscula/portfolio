# Project Documentation

Welcome to the Portfolio Monorepo documentation. This documentation is organized for easy navigation and maintenance.

> **🤖 For AI Agents**: See [AGENTS.md](../AGENTS.md) in the root directory for quick reference and development guidelines.

---

## 📚 Documentation Structure

### 🛠️ Setup & Development
- **[SETUP.md](./SETUP.md)** - Development environment setup instructions
- **[PATTERNS.md](./PATTERNS.md)** - Code patterns and examples (auth, API, validation, database)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide for Vercel (frontend & backend)

---

### 🏗️ Architecture

Core system architecture and technical documentation.

- **[System Architecture](./architecture/system-architecture.md)** - High-level architecture overview
- **[Database Schema](./architecture/database-schema.md)** - Database models, constraints, and business rules
- **[API Authentication](./architecture/API_AUTHENTICATION.md)** - Authentication implementation details

---

### 📦 Components

UI component guides and patterns.

- **[Portfolio Tables Guide](./components/portfolio-tables.md)** - Portfolio table components with usage examples

---

### 🚀 Features

Feature specifications following the **requirements → design → implementation** pattern.

#### Completed Features
- **[Accessibility](./features/accessibility/)** - WCAG 2.1 AA compliance
  - [Requirements](./features/accessibility/requirements.md)
  - [Design](./features/accessibility/design.md)
  - [Implementation](./features/accessibility/implementation.md)

- **[Pagination](./features/pagination/)** - Performance optimization for large datasets
  - [Requirements](./features/pagination/requirements.md)
  - [Design](./features/pagination/design.md)
  - [Implementation](./features/pagination/implementation.md)

- **[Dashboard Redesign](./features/dashboard/)** - Modern dashboard with portfolio table
  - [Requirements](./features/dashboard/requirements.md)
  - [Design](./features/dashboard/design.md)
  - [Tasks](./features/dashboard/tasks.md)

#### In Progress Features
- **[Dividend Progress View](./features/dividend-progress/)** - Visual dividend tracking
  - [Requirements](./features/dividend-progress/requirements.md)
  - [Design](./features/dividend-progress/design.md)
  - [Tasks](./features/dividend-progress/tasks.md)

---

### 📄 Product

Product requirements and roadmaps.

- **[API Product Requirements (PRD)](./product/API_PRD.md)** - API feature roadmap and security requirements

---

### 📊 Reports and Analysis

Performance analysis, optimization reports, and technical assessments.

- **[Performance Optimization](./reports/performance-optimization.md)** - Bundle optimization and performance improvements
- **[Code Improvements Tracker](./reports/WEB_CODE_IMPROVEMENTS.md)** - Refactoring tasks and codebase improvements
- **[Portfolio Metrics Performance](./reports/portfolio-metrics-performance.md)** - Portfolio metrics calculation analysis
- **[Reports Index](./reports/README.md)** - Complete list of available reports

---

### 🗄️ Archived Documentation

Historical documentation and migration guides.

> Old migration guides and checklists are preserved in [docs/archive/](./archive/) for reference.

- **[MONOREPO_MIGRATION_GUIDE.md](./archive/MONOREPO_MIGRATION_GUIDE.md)** - Complete monorepo migration guide
- **[MIGRATION.md](./archive/MIGRATION.md)** - Migration history and references

---

## 🔍 Quick Links

### For Developers
- [AGENTS.md](../AGENTS.md) - Quick reference and rules
- [PATTERNS.md](./PATTERNS.md) - Code patterns and examples
- [System Architecture](./architecture/system-architecture.md) - Understand the codebase
- [Database Schema](./architecture/database-schema.md) - Database structure and rules
- [SETUP.md](./SETUP.md) - Get started with local development

### For Product/Business
- [API PRD](./product/API_PRD.md) - Feature roadmap and requirements
- [Performance Reports](./reports/) - Technical analysis and improvements

### For Designers
- [Accessibility](./features/accessibility/) - Accessibility standards
- [Component Guides](./components/) - UI component documentation

---

## 📝 Documentation Guidelines

### Creating New Documentation

1. **Features**: Follow the requirements → design → implementation pattern
   - Create a new directory in `features/`
   - Include `requirements.md`, `design.md`, and `implementation.md`

2. **Architecture**: Place in `architecture/` directory
   - Focus on technical implementation details
   - Include diagrams where helpful

3. **Reports**: Place in `reports/` directory
   - Include date and context
   - Update the reports/README.md index

### Updating Existing Documentation

- Update the "Last Updated" date at the bottom of files
- Keep documentation in sync with code changes
- Archive outdated documentation instead of deleting it

---

**Last Updated**: 2025-12-26
