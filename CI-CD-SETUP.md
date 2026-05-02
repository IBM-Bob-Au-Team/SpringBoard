# CI/CD Setup Guide for SpringBoard

This document explains how to set up the GitHub Actions CI/CD pipeline for SpringBoard with all required secrets and security configurations.

## 🔐 Required GitHub Secrets

You need to configure the following secrets in your GitHub repository settings:

### Navigate to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 1. VERCEL_TOKEN
**Purpose:** Authenticates with Vercel for deployments

**How to get it:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it "SpringBoard GitHub Actions"
4. Copy the token
5. Add as `VERCEL_TOKEN` in GitHub secrets

### 2. SPRINGBOARD_GITHUB_TOKEN
**Purpose:** Allows SpringBoard to analyze and create branches in GitHub repos

**How to get it:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "SpringBoard API Access"
4. Expiration: Choose appropriate duration
5. Scopes needed:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
6. Click "Generate token"
7. Copy the token (starts with `ghp_`)
8. Add as `SPRINGBOARD_GITHUB_TOKEN` in GitHub secrets

### 3. WATSONX_API_KEY
**Purpose:** Authenticates with IBM watsonx.ai for AI-powered modernization

**How to get it:**
1. Go to https://cloud.ibm.com/iam/apikeys
2. Click "Create an IBM Cloud API key"
3. Name: "SpringBoard watsonx Access"
4. Copy the API key
5. Add as `WATSONX_API_KEY` in GitHub secrets

### 4. WATSONX_PROJECT_ID
**Purpose:** Identifies your watsonx.ai project

**How to get it:**
1. Go to https://dataplatform.cloud.ibm.com/projects
2. Open your project
3. Copy the Project ID from the project settings
4. Add as `WATSONX_PROJECT_ID` in GitHub secrets

### 5. WATSONX_URL
**Purpose:** The watsonx.ai API endpoint URL

**Value:** `https://us-south.ml.cloud.ibm.com`

Add as `WATSONX_URL` in GitHub secrets

## 🚀 Vercel Project Setup

### 1. Link Vercel Project
```bash
cd springboard-ui
vercel link
```

### 2. Configure Environment Variables in Vercel
Go to your Vercel project settings and add these environment variables:

**Production Environment:**
- `GITHUB_TOKEN` → Use the same value as `SPRINGBOARD_GITHUB_TOKEN`
- `WATSONX_API_KEY` → Use the same value from GitHub secrets
- `WATSONX_PROJECT_ID` → Use the same value from GitHub secrets
- `WATSONX_URL` → `https://us-south.ml.cloud.ibm.com`
- `NEXT_PUBLIC_APP_URL` → Your production URL (e.g., `https://springboard.vercel.app`)

**Preview Environment:**
- Same as production, but use preview URL for `NEXT_PUBLIC_APP_URL`

## 📋 Workflows Overview

### 1. Deploy Workflow (`.github/workflows/deploy.yml`)
**Triggers:** Push to `main` branch

**Jobs:**
1. **Security Check** - Scans for accidentally committed secrets using TruffleHog
2. **Build and Test** - Runs type checking, linting, and builds the app
3. **Deploy** - Deploys to Vercel production

**Security Features:**
- ✅ Uses pinned action versions with commit SHA
- ✅ Limited permissions (`contents: read`)
- ✅ Frozen lockfile installation
- ✅ Secrets passed as environment variables only
- ✅ No secrets in logs or outputs

### 2. PR Check Workflow (`.github/workflows/pr-check.yml`)
**Triggers:** Pull requests to `main` branch

**Jobs:**
1. **PR Security Check** - Scans PR changes for secrets and `.env.local` files
2. **PR Build Check** - Runs type checking, linting, and build

**Features:**
- ✅ Comments on PR with build status
- ✅ Prevents merging if checks fail
- ✅ Scans only PR changes (not entire repo)
- ✅ Checks for accidentally committed `.env.local`

## 🔒 Security Best Practices

### ✅ What We Do
1. **Pinned Action Versions** - All actions use commit SHA, not `@latest`
2. **Limited Permissions** - Workflows only get necessary permissions
3. **Secret Scanning** - TruffleHog scans every commit and PR
4. **Frozen Lockfile** - `--frozen-lockfile` prevents supply chain attacks
5. **No Secret Logging** - Secrets never appear in logs
6. **Environment Protection** - Production requires approval
7. **Branch Protection** - Only deploy from `main` branch

### ❌ What We Never Do
1. Never hardcode secrets in workflow files
2. Never use `@latest` for action versions
3. Never commit `.env.local` files
4. Never log sensitive data
5. Never give workflows more permissions than needed

## 🧪 Testing the Pipeline

### Test PR Workflow
```bash
# Create a feature branch
git checkout -b feature/test-ci

# Make a change
echo "test" >> README.md

# Commit and push
git add README.md
git commit -m "test: CI pipeline"
git push origin feature/test-ci

# Create PR on GitHub
# The PR check workflow will run automatically
```

### Test Deploy Workflow
```bash
# Merge PR to main
# The deploy workflow will run automatically
```

## 📊 Monitoring Deployments

### View Workflow Runs
1. Go to your GitHub repository
2. Click "Actions" tab
3. See all workflow runs and their status

### View Vercel Deployments
1. Go to https://vercel.com/dashboard
2. Select your SpringBoard project
3. See all deployments and their status

## 🐛 Troubleshooting

### Workflow Fails on Secret Scan
**Problem:** TruffleHog found a potential secret

**Solution:**
1. Review the flagged content
2. If it's a real secret, remove it and rotate the credential
3. If it's a false positive, add to `.trufflehogignore`

### Build Fails on Type Check
**Problem:** TypeScript errors in code

**Solution:**
```bash
cd springboard-ui
pnpm typecheck
# Fix the errors shown
```

### Build Fails on Lint
**Problem:** ESLint errors in code

**Solution:**
```bash
cd springboard-ui
pnpm lint
# Fix the errors shown
```

### Deployment Fails
**Problem:** Vercel deployment failed

**Solution:**
1. Check Vercel logs in the workflow output
2. Verify all environment variables are set in Vercel
3. Verify `VERCEL_TOKEN` is valid in GitHub secrets

### Missing Environment Variables
**Problem:** App crashes due to missing env vars

**Solution:**
1. Check `.env.example` for required variables
2. Add missing variables to Vercel project settings
3. Redeploy

## 📝 Pull Request Template

When creating a PR, you'll see a template with:
- Description of changes
- Developer branch identification (Dev1/Dev2/Dev3)
- Bob sessions checklist
- Security checklist (must be completed)
- Testing checklist

**All security checklist items must be checked before merging!**

## 🎯 Next Steps

1. ✅ Add all required secrets to GitHub repository
2. ✅ Configure Vercel project with environment variables
3. ✅ Test the pipeline with a PR
4. ✅ Monitor first production deployment
5. ✅ Set up branch protection rules (optional but recommended)

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [TruffleHog Secret Scanning](https://github.com/trufflesecurity/trufflehog)
- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)

---
*Made with SpringBoard - Secure by Design*