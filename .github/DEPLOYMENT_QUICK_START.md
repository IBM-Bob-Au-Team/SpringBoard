# 🚀 Deployment Quick Start Guide

Quick reference for deploying SpringBoard to production.

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

- [ ] GitHub repository created
- [ ] Vercel account set up
- [ ] All required tokens generated:
  - [ ] GitHub Personal Access Token (with `repo` scope)
  - [ ] Vercel deployment token
  - [ ] IBM watsonx API key
  - [ ] IBM watsonx Project ID

## ⚡ 5-Minute Setup

### Step 1: Configure GitHub Secrets (2 minutes)

Go to: `Repository Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add these 5 secrets:

```
VERCEL_TOKEN=your_vercel_token_here
SPRINGBOARD_GITHUB_TOKEN=ghp_your_github_token_here
WATSONX_API_KEY=your_watsonx_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### Step 2: Configure Vercel Project (2 minutes)

```bash
cd springboard-ui
vercel link
```

Then in Vercel dashboard, add environment variables:
- `GITHUB_TOKEN` → Same as `SPRINGBOARD_GITHUB_TOKEN`
- `WATSONX_API_KEY` → Same value
- `WATSONX_PROJECT_ID` → Same value
- `WATSONX_URL` → `https://us-south.ml.cloud.ibm.com`
- `NEXT_PUBLIC_APP_URL` → Your production URL

### Step 3: Deploy (1 minute)

```bash
git add .
git commit -m "feat: initial deployment setup"
git push origin main
```

✅ **Done!** GitHub Actions will automatically:
1. Scan for secrets
2. Run tests and build
3. Deploy to Vercel

## 🔍 Verify Deployment

### Check GitHub Actions
1. Go to `Actions` tab in GitHub
2. See the "Deploy SpringBoard to Vercel" workflow running
3. Wait for all jobs to complete (green checkmarks)

### Check Vercel
1. Go to Vercel dashboard
2. See your SpringBoard project
3. Click on the deployment
4. Visit the production URL

### Test the Application
1. Open your production URL
2. Try analyzing a public Spring Boot repo
3. Verify the analysis works correctly

## 🐛 Troubleshooting

### Deployment Fails on Secret Scan
**Error:** TruffleHog found potential secrets

**Fix:**
```bash
# Check what was flagged
git log -1 --stat

# If it's a real secret, remove it
git reset --soft HEAD~1
# Remove the secret, commit again

# If it's a false positive, add to .trufflehogignore
echo "path/to/file" >> .trufflehogignore
git add .trufflehogignore
git commit --amend
git push origin main --force
```

### Deployment Fails on Build
**Error:** Type check or lint errors

**Fix:**
```bash
cd springboard-ui

# Run checks locally
pnpm typecheck
pnpm lint
pnpm build

# Fix any errors shown
# Then commit and push
```

### Vercel Deployment Fails
**Error:** Missing environment variables

**Fix:**
1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Add all required variables
4. Redeploy from Vercel dashboard

### Application Crashes
**Error:** Runtime errors in production

**Fix:**
1. Check Vercel logs in dashboard
2. Verify all environment variables are set
3. Check for missing dependencies
4. Review error stack trace

## 📊 Monitoring

### GitHub Actions
- **URL:** `https://github.com/YOUR_USERNAME/SpringBoard/actions`
- **Check:** Every push to main
- **Expected:** All green checkmarks

### Vercel Dashboard
- **URL:** `https://vercel.com/dashboard`
- **Check:** Deployment status and logs
- **Expected:** "Ready" status

### Application Health
- **URL:** Your production URL
- **Check:** Homepage loads, analysis works
- **Expected:** No errors in browser console

## 🔄 Making Updates

### For Code Changes
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ...

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# Create PR on GitHub
# PR checks will run automatically
# Merge when checks pass
# Deployment happens automatically
```

### For Environment Variables
1. Update in Vercel dashboard
2. Redeploy (or wait for next push to main)

### For Dependencies
```bash
cd springboard-ui
pnpm add package-name
# or
pnpm add -D package-name

# Commit the changes
git add package.json pnpm-lock.yaml
git commit -m "chore: add package-name"
git push origin main
```

## 🔒 Security Reminders

- ✅ Never commit `.env.local`
- ✅ Never hardcode tokens in code
- ✅ Always use server-side variables for secrets
- ✅ Rotate tokens regularly
- ✅ Review PR security checklist

## 📚 Additional Resources

- **Full Setup Guide:** [CI-CD-SETUP.md](./CI-CD-SETUP.md)
- **Security Checklist:** [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)
- **Main README:** [README.md](../README.md)

## 🆘 Need Help?

1. Check [CI-CD-SETUP.md](./CI-CD-SETUP.md) for detailed instructions
2. Review [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) for security issues
3. Check GitHub Actions logs for error details
4. Check Vercel logs for runtime errors

---
*Made with SpringBoard - Deploy with Confidence*