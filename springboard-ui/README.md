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

## Security

### Environment Variables

SpringBoard uses environment variables to securely manage sensitive credentials and configuration. **Never commit `.env.local` to version control.**

#### Setup

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Fill in your values in `.env.local`

#### Required Variables

**Server-Side Only** (Never exposed to browser):

- `GITHUB_TOKEN` - Your GitHub Personal Access Token
  - **Where to get it**: [Create token on GitHub](https://github.com/settings/tokens/new?scopes=repo&description=SpringBoard%20Analysis)
  - **Minimum permissions**: `public_repo` (read access to public repositories)
  - **Optional permissions**: `repo` (for private repositories)
  - **Used for**: Fallback token to avoid rate limiting when users don't provide their own
  - **Security**: Never logged, never sent to browser, only used in API routes

- `WATSONX_API_KEY` - IBM watsonx API key (optional, for future features)
  - **Where to get it**: [IBM Cloud API Keys](https://cloud.ibm.com/)
  - **Used for**: Full auto-modernization pipeline (coming soon)

- `WATSONX_PROJECT_ID` - Your watsonx project ID (optional)
  - **Where to find**: watsonx project settings

- `WATSONX_URL` - watsonx API endpoint (optional)
  - **Example**: `https://us-south.ml.cloud.ibm.com`

**Public** (Safe for browser - has `NEXT_PUBLIC_` prefix):

- `NEXT_PUBLIC_APP_URL` - Your application URL
  - **Development**: `http://localhost:3000`
  - **Production**: `https://your-domain.vercel.app`
  - **Used for**: CORS configuration and absolute URLs

#### Rate Limiting Configuration

- `RATE_LIMIT_MAX` - Maximum requests per IP (default: 5)
- `RATE_LIMIT_WINDOW_MS` - Time window in milliseconds (default: 60000 = 1 minute)

### Creating a GitHub Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens/new)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "SpringBoard Analysis"
4. Select scopes:
   - ✅ `public_repo` - For analyzing public repositories
   - ✅ `repo` (optional) - For analyzing private repositories
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)
7. Add to `.env.local`: `GITHUB_TOKEN=ghp_your_token_here`

**Security Best Practices:**
- ✅ Use minimum required permissions
- ✅ Rotate tokens regularly
- ✅ Never commit tokens to git
- ✅ Use different tokens for development and production
- ✅ Revoke tokens immediately if compromised

### Server-Side vs Public Variables

**Server-Side Only** (No `NEXT_PUBLIC_` prefix):
- Only accessible in API routes and server components
- Never sent to the browser
- Used for sensitive credentials (tokens, API keys)
- Examples: `GITHUB_TOKEN`, `WATSONX_API_KEY`

**Public** (Has `NEXT_PUBLIC_` prefix):
- Accessible in both server and client code
- Sent to the browser (visible in source code)
- Only use for non-sensitive configuration
- Example: `NEXT_PUBLIC_APP_URL`

### Production Deployment

When deploying to Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all variables from `.env.local`
4. Use different tokens for production
5. Never use development tokens in production

### Security Notes

⚠️ **NEVER**:
- Commit `.env.local` to git (it's in `.gitignore`)
- Log or expose tokens in code
- Use `NEXT_PUBLIC_` prefix for sensitive data
- Hardcode secrets in source code
- Share tokens in screenshots or documentation

✅ **ALWAYS**:
- Use environment variables for secrets
- Keep `.env.local` secure and private
- Use minimum required permissions
- Rotate tokens regularly
- Use different tokens for dev/prod

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