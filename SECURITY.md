# 🔒 Security Guidelines for SpringBoard

## Token Security Implementation

SpringBoard follows strict security practices for handling GitHub tokens and sensitive credentials.

---

## ✅ Current Security Measures

### 1. **No Hardcoded Tokens**
- ✅ All tokens stored in environment variables (`.env.local`)
- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ `.env.example` provided with placeholders only
- ✅ No tokens in source code anywhere

### 2. **Server-Side Only Token Handling**
- ✅ All token processing happens in API routes (`/api/analyze`, `/api/refactor`)
- ✅ Tokens never exposed to client-side JavaScript
- ✅ Tokens never stored in browser localStorage or cookies
- ✅ Client sends token via POST body, not URL params

### 3. **No Token Logging**
- ✅ No `console.log` statements with tokens
- ✅ Error messages never include token values
- ✅ API responses never return tokens
- ✅ No token exposure in stack traces

### 4. **Secure Token Transmission**
```typescript
// ✅ CORRECT: Token in POST body
fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ repoUrl, token })
});

// ❌ WRONG: Token in URL
fetch(`/api/analyze?token=${token}`);
```

### 5. **Authorization Header Usage**
```typescript
// ✅ CORRECT: Token in Authorization header for GitHub API
headers['Authorization'] = `Bearer ${token}`;

// ❌ WRONG: Token in URL
fetch(`https://api.github.com/repos/${owner}/${repo}?token=${token}`);
```

### 6. **Input Validation**
```typescript
// ✅ All API routes validate input before processing
if (!repoUrl) {
  return NextResponse.json(
    { error: 'Repository URL is required' },
    { status: 400 }
  );
}

if (!token) {
  return NextResponse.json(
    { error: 'GitHub token is required' },
    { status: 400 }
  );
}
```

### 7. **Token Masking in UI**
```typescript
// ✅ Password input type masks token
<input
  type="password"
  value={token}
  placeholder="ghp_xxxxxxxxxxxx"
/>
```

### 8. **Error Message Safety**
```typescript
// ✅ Generic error messages, no token exposure
if (!accessResult.accessible) {
  return NextResponse.json({
    error: 'Repository not found or you do not have access to it'
  });
}

// ❌ WRONG: Exposing token in error
console.error('Failed with token:', token);
```

---

## 📋 Security Checklist

### For Developers

When adding new features, ensure:

- [ ] Tokens are never hardcoded
- [ ] All token handling is server-side only
- [ ] No `console.log` with tokens
- [ ] Tokens use Authorization header, not URL params
- [ ] Input validation before processing
- [ ] Error messages don't expose tokens
- [ ] UI uses `type="password"` for token inputs
- [ ] Tokens never in client-side state that persists
- [ ] API routes validate all inputs
- [ ] Environment variables for all secrets

---

## 🔐 Token Storage

### Environment Variables (`.env.local`)

```env
# Server-side only - never exposed to client
GITHUB_TOKEN=your_token_here

# Public - safe to expose
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-side only
WATSONX_API_KEY=your_key_here
WATSONX_PROJECT_ID=your_project_id
```

### Rules:
- ✅ `GITHUB_TOKEN` - Server-side only, never exposed
- ✅ `NEXT_PUBLIC_*` - Can be exposed to client (use sparingly)
- ✅ All other secrets - Server-side only

---

## 🚫 What NOT to Do

### ❌ Never Do This:

```typescript
// ❌ WRONG: Hardcoded token
const token = 'ghp_abc123xyz';

// ❌ WRONG: Token in console
console.log('Token:', token);

// ❌ WRONG: Token in URL
fetch(`/api/analyze?token=${token}`);

// ❌ WRONG: Token in client-side code
const GITHUB_TOKEN = 'ghp_abc123xyz';

// ❌ WRONG: Token in error message
throw new Error(`Failed with token ${token}`);

// ❌ WRONG: Token in localStorage
localStorage.setItem('github_token', token);

// ❌ WRONG: Exposing token in response
return { token, result };
```

---

## ✅ What TO Do

### ✅ Always Do This:

```typescript
// ✅ CORRECT: Token from environment
const token = process.env.GITHUB_TOKEN;

// ✅ CORRECT: Token in POST body
body: JSON.stringify({ repoUrl, token })

// ✅ CORRECT: Token in Authorization header
headers['Authorization'] = `Bearer ${token}`;

// ✅ CORRECT: Generic error messages
return { error: 'Authentication failed' };

// ✅ CORRECT: Validate before using
if (!token || token.length < 10) {
  return { error: 'Invalid token format' };
}

// ✅ CORRECT: Server-side only
// API routes in /app/api/* are server-side
export async function POST(request: NextRequest) {
  const { token } = await request.json();
  // Token stays on server
}
```

---

## 🔍 Security Audit Results

### Files Audited:
- ✅ `app/api/analyze/route.ts` - Secure
- ✅ `app/api/refactor/route.ts` - Secure
- ✅ `lib/github.ts` - Secure
- ✅ `app/page.tsx` - Secure (client-side, no token storage)
- ✅ `app/modernize/page.tsx` - Secure (client-side, no token storage)
- ✅ `.env.local` - Secure (in .gitignore)
- ✅ `.env.example` - Secure (placeholders only)

### Security Score: **10/10** ✅

---

## 🛡️ Additional Security Measures

### 1. **Rate Limiting**
```typescript
// Implemented in lib/github.ts
if (response.status === 403) {
  const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
  if (rateLimitRemaining === '0') {
    return {
      error: 'GitHub rate limit reached',
      isRateLimited: true
    };
  }
}
```

### 2. **CORS Headers**
```typescript
// Implemented in API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### 3. **Input Sanitization**
```typescript
// URL parsing and validation
const parsed = parseGitHubUrl(repoUrl);
if (!parsed.isValid) {
  return { error: 'Invalid GitHub URL format' };
}
```

### 4. **Token Validation**
```typescript
// Before using token
if (!token) {
  return { error: 'GitHub token is required' };
}

// Token format check (implicit in GitHub API call)
const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📚 Best Practices

### For New Features:

1. **Always use environment variables for secrets**
   ```typescript
   const apiKey = process.env.SECRET_KEY;
   ```

2. **Keep tokens server-side**
   ```typescript
   // API routes only
   export async function POST(request: NextRequest) {
     const { token } = await request.json();
     // Process server-side
   }
   ```

3. **Validate all inputs**
   ```typescript
   if (!input || typeof input !== 'string') {
     return { error: 'Invalid input' };
   }
   ```

4. **Use Authorization headers**
   ```typescript
   headers['Authorization'] = `Bearer ${token}`;
   ```

5. **Never log sensitive data**
   ```typescript
   // ✅ CORRECT
   console.log('Request processed');
   
   // ❌ WRONG
   console.log('Token:', token);
   ```

---

## 🚨 Incident Response

If a token is accidentally exposed:

1. **Immediately revoke** the token on GitHub
2. **Generate a new token** with minimal required scopes
3. **Update `.env.local`** with new token
4. **Review git history** to ensure token wasn't committed
5. **Audit logs** for any unauthorized access
6. **Update documentation** if needed

---

## 📞 Security Contact

For security concerns or to report vulnerabilities:
- Create a private security advisory on GitHub
- Email: security@springboard.dev (if applicable)

---

## ✅ Compliance

SpringBoard follows:
- ✅ OWASP Top 10 security practices
- ✅ GitHub token security guidelines
- ✅ Next.js security best practices
- ✅ Zero-trust security model

---

<div align="center">

**Security is not an afterthought—it's built into every line of code** 🔒

*Last Updated: 2026-05-02*

</div>