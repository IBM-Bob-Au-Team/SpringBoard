# SpringBoard UI

A modern Next.js 14 showcase website demonstrating IBM Bob IDE's capability to modernize legacy Spring Boot 2 applications to Spring Boot 3.x with automated refactoring, testing, and deployment.

## What is SpringBoard?

SpringBoard is a demonstration project created for the **IBM Bob Dev Day Hackathon 2026** that showcases how IBM Bob IDE can automatically modernize a legacy Spring Boot 2 application to Spring Boot 3.x. The project includes:

- Automated code refactoring (javax.* → jakarta.*)
- Dependency upgrades (Java 11 → 17, Spring Boot 2.x → 3.1.5)
- Docker containerization with health checks
- Comprehensive documentation and testing
- Professional web interface to showcase the results

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: pnpm
- **Design System**: IBM Blue (#0F62FE)

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

```bash
# Navigate to the UI directory
cd springboard-ui

# Install dependencies
pnpm install
```

### Development

```bash
# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Linting

```bash
# Run ESLint
pnpm lint
```

## Pages Overview

### 🏠 Home Page (`/`)
The landing page featuring:
- **Hero Section**: Introduction to SpringBoard with call-to-action buttons
- **Stats Bar**: Key metrics (9 files modernized, 1,200+ lines of code, 545 lines of docs, ~8 hours saved)
- **How It Works**: 3-step process overview (Analyze → Modernize → Deploy)
- **Key Features**: Highlights of automated refactoring, dependency management, and comprehensive documentation

### 🎬 Demo Page (`/demo`)
Interactive demonstration showing the 5-step modernization workflow:
1. **Analysis Phase**: Codebase scanning and dependency mapping
2. **Refactoring Phase**: Automated code updates with before/after diffs
3. **Testing Phase**: Automated test generation and validation
4. **Documentation Phase**: Changelog and deployment guide creation
5. **Deployment Phase**: Docker containerization with health checks

Each step includes:
- Visual timeline with progress indicators
- Code snippets showing actual changes
- Before/after comparisons
- Command examples

### 📊 Report Page (`/report`)
Comprehensive modernization dashboard displaying:
- **Summary Statistics**: 
  - Files modified: 9
  - Lines changed: 1,200+
  - Test coverage: 85%
  - Time saved: ~8 hours
- **Before/After Comparison Table**: Side-by-side comparison of key technologies
- **Files Changed**: Detailed list of all modified files with risk levels
- **Bob Sessions**: Information about the three development sessions

### 👥 Team Page (`/team`)
Meet the SpringBoard team:
- **Sam Yati** (Dev 1 - Senior Architect): Codebase analysis and architecture planning
- **Win Yu Maung** (Dev 2 - Lead Developer): Code refactoring and Spring Boot 3 migration
- **Swan Htet Aung** (Dev 3 - QA Engineer): Testing, validation, and documentation

Each team member card includes:
- Role and responsibilities
- Contact information (email, GitHub)
- Key contributions to the project
- IBM Bob mode used

## Project Structure

```
springboard-ui/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles with IBM Blue theme
│   ├── demo/              # Demo page
│   │   └── page.tsx
│   ├── report/            # Report dashboard
│   │   └── page.tsx
│   └── team/              # Team members page
│       └── page.tsx
├── components/            # React components
│   ├── Navigation.tsx     # Header navigation
│   ├── Footer.tsx         # Footer component
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   └── utils.ts          # Helper utilities
├── public/               # Static assets
├── .env.local           # Environment variables
├── next.config.mjs      # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS with IBM Blue
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## Design System

### Primary Color: IBM Blue

The application uses IBM Blue (#0F62FE) as the primary brand color with a full color palette:

- Primary 500: `#0F62FE` (Default)
- Primary 50-950: Full range of shades for various UI elements

### Color Usage
- **Primary**: Buttons, links, highlights, badges
- **Background**: Dark theme (#161616) for modern look
- **Text**: White for primary text, gray-400 for secondary text
- **Borders**: Gray-800 for subtle separations

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, large sizes (5xl-7xl)
- **Body**: Regular weight, readable sizes

## Key Features

### 🎨 Modern Design
- Dark theme with IBM Blue accents
- Responsive layout for all screen sizes
- Smooth transitions and hover effects
- Professional gradient backgrounds

### 🧭 Navigation
- Sticky header with logo and navigation links
- Consistent navigation across all pages
- "Powered by IBM Bob" badge
- Footer with quick links and resources

### 📱 Responsive
- Mobile-first design approach
- Breakpoints for tablet and desktop
- Flexible grid layouts
- Touch-friendly interactive elements

### ⚡ Performance
- Next.js 14 App Router for optimal performance
- Static generation where possible
- Optimized images and assets
- Fast page transitions

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Adding shadcn/ui Components

```bash
# Example: Add a button component
npx shadcn-ui@latest add button
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [IBM Design Language](https://www.ibm.com/design/language/)

## Project Context

This UI is part of the larger SpringBoard project that includes:
- **Legacy Application**: Original Spring Boot 2 sample app
- **Modernized Application**: Upgraded Spring Boot 3.1.5 version
- **Documentation**: Analysis reports, modernization plans, changelogs
- **This UI**: Showcase website for the modernization results

## License

MIT

---

**Built with ❤️ using IBM Bob IDE for the IBM Bob Dev Day Hackathon 2026**