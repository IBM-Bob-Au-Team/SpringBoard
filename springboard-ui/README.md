# SpringBoard UI

A modern Next.js 14 web application that provides instant analysis and modernization insights for Spring Boot applications, helping developers understand migration requirements from Spring Boot 2 to Spring Boot 3.

## What is SpringBoard?

SpringBoard is an AI-powered analysis platform created for the **IBM Bob Dev Day Hackathon 2026** that helps developers:

- **Analyze** any Spring Boot repository instantly
- **Detect** Spring Boot version, Java version, and dependencies
- **Identify** migration issues and compatibility problems
- **Provide** actionable recommendations for modernization
- **Support** both public and private repositories
- **Integrate** optionally with IBM watsonx.ai for AI-powered refactoring

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
The main landing page featuring:
- **Hero Section**: Introduction to SpringBoard with repository URL input
- **Repository Analysis**: Instant analysis of any Spring Boot repository
- **Analysis Results**: Comprehensive report with version detection and issue identification
- **Modernization Options**: Choose between viewing analysis or AI-powered refactoring

### 📊 Reports Page (`/reports`)
View detailed analysis reports including:
- **Version Information**: Spring Boot and Java versions
- **Dependency Analysis**: Complete list of Maven dependencies
- **Migration Issues**: Identified problems and compatibility concerns
- **Recommendations**: Actionable steps for modernization

### 🔄 Modernize Page (`/modernize`)
Advanced modernization options:
- **View Analysis**: Review detailed analysis report (no authentication required)
- **AI Refactoring**: Optional watsonx.ai-powered code modernization (requires API key)
- **Token Input**: Secure GitHub token handling for private repositories

### 🎬 Demo Page (`/demo`)
Interactive demonstration showing:
- How SpringBoard analyzes repositories
- Example analysis results
- Migration recommendations
- Step-by-step modernization process

### 👥 Team Page (`/team`)
Meet the SpringBoard development team:
- **Sam Yati** (Dev 1 - Analyst & Planner)
  - Email: samyati.syt@gmail.com
  - GitHub: @narattscoward
  - Role: Codebase analysis and modernization planning
- **Win Yu Maung** (Dev 2 - Full-Stack Developer)
  - Email: winyumg2003a@gmail.com
  - GitHub: @Kusk24
  - Role: UI development and frontend implementation
- **Swan Htet Aung** (Dev 3 - Backend & DevOps)
  - Email: swanhtetag09@gmail.com
  - GitHub: @swanhtetaung01
  - Role: API development, GitHub integration, CI/CD pipeline

## Project Structure

```
springboard-ui/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page with analysis
│   ├── globals.css              # Global styles with IBM Blue theme
│   ├── api/                     # API Routes
│   │   ├── analyze/             # Repository analysis endpoint
│   │   │   └── route.ts
│   │   ├── refactor/            # Code refactoring endpoint
│   │   │   └── route.ts
│   │   └── ai-refactor/         # AI-powered refactoring
│   │       └── route.ts
│   ├── demo/                    # Demo page
│   │   └── page.tsx
│   ├── modernize/               # Modernization options
│   │   └── page.tsx
│   ├── reports/                 # Analysis reports
│   │   └── page.tsx
│   └── team/                    # Team members page
│       └── page.tsx
├── components/                  # React components
│   ├── AnalysisResult.tsx      # Analysis display component
│   ├── Navigation.tsx           # Header navigation
│   ├── Footer.tsx               # Footer component
│   ├── RefactorModal.tsx        # Refactoring modal
│   ├── TokenInput.tsx           # Secure token input
│   ├── TeamMemberAvatar.tsx     # Team member cards
│   └── ui/                      # shadcn/ui components
├── lib/                         # Utility functions and helpers
│   ├── github.ts                # GitHub API integration
│   ├── watsonx.ts               # IBM watsonx.ai integration
│   ├── types.ts                 # TypeScript type definitions
│   ├── env.ts                   # Environment variable validation
│   ├── rateLimit.ts             # Rate limiting utilities
│   ├── constants.ts             # Application constants
│   └── utils.ts                 # Helper utilities
├── middleware.ts                # Next.js middleware
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment variables (gitignored)
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS with IBM Blue
├── tsconfig.json                # TypeScript configuration
├── vercel.json                  # Vercel deployment config
└── package.json                 # Dependencies
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

### 🔍 Repository Analysis
- Instant analysis of any GitHub repository
- Automatic Spring Boot and Java version detection
- Complete dependency parsing from pom.xml
- Migration issue identification
- Multi-branch support (default, main, master)

### 🎨 Modern Design
- Dark theme with IBM Blue (#0F62FE) accents
- Responsive layout for all screen sizes
- Smooth transitions and hover effects
- Professional, clean interface

### 🔒 Security
- Server-side only token handling
- No tokens exposed to client
- Secure API routes with validation
- Rate limiting protection
- CORS configuration

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
- Server-side rendering where beneficial
- Optimized API routes
- Fast page transitions
- Smart caching strategies

## Security

### Environment Variables

SpringBoard uses environment variables to securely manage sensitive credentials. **Never commit `.env.local` to version control.**

#### Setup

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Fill in your values in `.env.local` (all optional for basic usage)

#### Optional Variables

**Server-Side Only** (Never exposed to browser):

- `GITHUB_TOKEN` - Your GitHub Personal Access Token (optional)
  - **Where to get it**: [Create token on GitHub](https://github.com/settings/tokens/new?scopes=repo&description=SpringBoard%20Analysis)
  - **Permissions needed**: `public_repo` (for public repos) or `repo` (for private repos)
  - **Used for**: Fallback token to avoid rate limiting, access to private repositories
  - **Security**: Never logged, never sent to browser, only used in API routes
  - **Note**: SpringBoard works without this for public repository analysis

- `WATSONX_API_KEY` - IBM watsonx.ai API key (optional)
  - **Where to get it**: [IBM Cloud API Keys](https://cloud.ibm.com/)
  - **Used for**: AI-powered code refactoring feature

- `WATSONX_PROJECT_ID` - Your watsonx.ai project ID (optional)
  - **Where to find**: watsonx.ai project settings

- `WATSONX_URL` - watsonx.ai API endpoint (optional)
  - **Default**: `https://us-south.ml.cloud.ibm.com`

**Public** (Safe for browser - has `NEXT_PUBLIC_` prefix):

- `NEXT_PUBLIC_APP_URL` - Your application URL (optional)
  - **Development**: `http://localhost:3000`
  - **Production**: `https://springboard-pink.vercel.app`
  - **Used for**: CORS configuration

#### Rate Limiting Configuration (Optional)

- `RATE_LIMIT_MAX` - Maximum requests per IP (default: 10)
- `RATE_LIMIT_WINDOW_MS` - Time window in milliseconds (default: 60000 = 1 minute)

### Creating a GitHub Token (Optional)

Only needed for private repositories or to avoid rate limits:

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens/new)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "SpringBoard Analysis"
4. Select scopes:
   - ✅ `public_repo` - For public repositories (sufficient for most use cases)
   - ✅ `repo` (optional) - For private repositories
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)
7. Add to `.env.local`: `GITHUB_TOKEN=ghp_your_token_here`

**Security Best Practices:**
- ✅ Use minimum required permissions
- ✅ Rotate tokens regularly
- ✅ Never commit tokens to git
- ✅ Use different tokens for development and production
- ✅ Revoke tokens immediately if compromised

**Note**: SpringBoard works perfectly without a token for analyzing public repositories!

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
- **Web Application**: Next.js 14 analysis platform (this directory)
- **Legacy Application**: Original Spring Boot 2 sample app in [`legacy-app/`](../legacy-app/)
- **Modernization Output**: Analysis reports and plans in [`modernization-output/`](../modernization-output/)
- **Documentation**: Comprehensive guides and security documentation
- **CI/CD Pipeline**: GitHub Actions workflows for automated deployment

## License

MIT

---

**Built with ❤️ using IBM Bob IDE for the IBM Bob Dev Day Hackathon 2026**