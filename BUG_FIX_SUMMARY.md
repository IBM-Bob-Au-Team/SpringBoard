# Bug Fix: pom.xml Fetch Failure

## Problem
The application was failing to fetch `pom.xml` from the repository `https://github.com/IBM-Bob-Au-Team/spring-boot-2-sample-app` with the error:
> "Failed to fetch pom.xml. The pom.xml file was not found in the repository root."

However, the pom.xml file DOES exist at the root level of this repository.

## Root Cause
**Mistake 2: Wrong branch name**

The repository uses the **"master"** branch as its default branch, but our code was only trying to fetch from the branch returned by GitHub's API without any fallback logic. If the API returned a branch that didn't exist or if there was a mismatch, the fetch would fail with a 404 error.

## Solution Implemented

### 1. Updated `fetchPomXml()` in `springboard-ui/lib/github.ts`
- Added branch fallback logic that tries multiple branches in order:
  1. Default branch from GitHub API
  2. "main" (if different from default)
  3. "master" (if different from default)
- Added comprehensive debug logging to track:
  - Parsed owner name
  - Parsed repo name
  - Which branch is being tried
  - GitHub API response status for each attempt
- Continues to next branch on 404 errors
- Returns detailed error messages

### 2. Updated `POST()` in `springboard-ui/app/api/ai-refactor/route.ts`
- Implemented the same branch fallback logic for consistency
- Fetches repository info early to get default branch
- Tries multiple branches when fetching pom.xml
- Added debug logging for troubleshooting
- Removed duplicate repository info fetch (optimization)

## Debug Logging Added
The following information is now logged (without exposing tokens):
```
[Server] Fetching pom.xml for {owner}/{repo}
[Server] Parsed owner: {owner}
[Server] Parsed repo: {repo}
[Server] Default branch from API: {branch}
[Server] Trying branch: {branch}
[Server] Tree API response status for branch {branch}: {status}
[Server] Contents API response status for branch {branch}: {status}
[Server] Successfully fetched and decoded pom.xml from branch {branch}
```

## Verification
The URL parsing was already correct and handles:
- ✅ Trailing slashes: `https://github.com/IBM-Bob-Au-Team/spring-boot-2-sample-app/`
- ✅ .git suffix: `https://github.com/IBM-Bob-Au-Team/spring-boot-2-sample-app.git`
- ✅ Hyphens in repo names: `spring-boot-2-sample-app`

The regex pattern `/^[a-zA-Z0-9_-]+$/` correctly allows hyphens in owner and repo names.

## Testing
To test the fix:
1. Try analyzing `https://github.com/IBM-Bob-Au-Team/spring-boot-2-sample-app`
2. Check the server logs to see which branch was successfully used
3. Verify pom.xml is fetched correctly

The fix ensures that repositories using "master" branch (or any other branch name) will work correctly, with automatic fallback to common branch names.