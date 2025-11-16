# Portfolio Application Documentation

Welcome to the comprehensive documentation for the dividend portfolio tracking application. This documentation is organized following a structured pattern for easy navigation and maintenance.

## 📁 Documentation Structure

### 🏗️ Architecture Documentation
**Location:** `architecture/`  
**Purpose:** System architecture, technology stack, and project structure documentation.

- **[System Architecture](architecture/system-architecture.md)** - Comprehensive architecture overview for engineers
- **[Technology Stack](architecture/technology-stack.md)** - Framework, tools, and development environment
- **[Project Structure](architecture/project-structure.md)** - Directory organization and architectural patterns

### 🚀 Feature Documentation
**Location:** `features/`  
**Purpose:** Feature specifications following the requirements → design → implementation pattern.

#### Completed Features
- **[Accessibility](features/accessibility/)** - WCAG 2.1 AA compliance and inclusive design
  - [Requirements](features/accessibility/requirements.md) - User stories and acceptance criteria
  - [Design](features/accessibility/design.md) - Implementation patterns and best practices
  - [Implementation](features/accessibility/implementation.md) - Task completion summary

- **[Pagination](features/pagination/)** - Performance optimization for large datasets
  - [Requirements](features/pagination/requirements.md) - Pagination and performance requirements
  - [Design](features/pagination/design.md) - Design patterns and optimization strategies
  - [Implementation](features/pagination/implementation.md) - Implementation details and metrics

- **[Dashboard Redesign](features/dashboard/)** - Modern dashboard with portfolio table
  - [Requirements](features/dashboard/requirements.md) - Dashboard functionality requirements
  - [Design](features/dashboard/design.md) - UI/UX design specifications
  - [Tasks](features/dashboard/tasks.md) - Implementation task breakdown

#### In Progress Features
- **[Dividend Progress View](features/dividend-progress/)** - Visual dividend tracking
  - [Requirements](features/dividend-progress/requirements.md) - Dividend visualization requirements
  - [Design](features/dividend-progress/design.md) - Chart and metrics design
  - [Tasks](features/dividend-progress/tasks.md) - Implementation plan (2/12 tasks completed)

### 📊 Reports and Analysis
**Location:** `reports/`
**Purpose:** Performance analysis, optimization reports, and technical assessments.

- **[Performance Optimization](reports/performance-optimization.md)** - Bundle optimization and performance improvements
- **[Code Improvements Tracker](code-improvements.md)** - Refactoring tasks and codebase improvements
- **[Reports Index](reports/README.md)** - Complete list of available reports

### 📦 Component Documentation
**Location:** `components/`
**Purpose:** Detailed guides for understanding and using UI components.

- **[Portfolio Tables Guide](components/portfolio-tables.md)** - Complete guide to portfolio table components with decision tree

## 🎯 Quick Navigation

### For New Engineers
1. Start with [System Architecture](architecture/system-architecture.md) for project overview
2. Review [Technology Stack](architecture/technology-stack.md) for development setup
3. Check [Project Structure](architecture/project-structure.md) for code organization

### For Feature Development
1. Review feature requirements in `features/[feature-name]/requirements.md`
2. Understand design patterns in `features/[feature-name]/design.md`
3. Check implementation status in `features/[feature-name]/implementation.md` or `tasks.md`

### For Performance Optimization
1. Review [Performance Optimization Report](reports/performance-optimization.md)
2. Check [Code Improvements Tracker](code-improvements.md) for refactoring opportunities
3. Check accessibility implementation in `features/accessibility/`
4. Review pagination optimizations in `features/pagination/`

## 📋 Documentation Standards

### File Naming Convention
- **Architecture:** `category-name.md` (e.g., `system-architecture.md`)
- **Features:** `requirements.md`, `design.md`, `implementation.md` or `tasks.md`
- **Reports:** `category-description.md` (e.g., `performance-optimization.md`)

### Content Structure
- **Requirements:** User stories with acceptance criteria
- **Design:** Implementation patterns and technical specifications
- **Implementation:** Task completion and technical details
- **Reports:** Analysis, findings, and recommendations

## 🔄 Maintenance

### Regular Updates
- **Feature completion:** Update implementation status
- **Architecture changes:** Update system documentation
- **Performance improvements:** Add new optimization reports
- **Quarterly reviews:** Update all documentation for accuracy

### Contributing
1. Follow the established structure and naming conventions
2. Include clear descriptions and navigation links
3. Update this README when adding new documentation
4. Maintain consistency with existing patterns

## 📚 External Resources

### Development
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Accessibility
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Last Updated:** October 2025  
**Maintained by:** Engineering Team
