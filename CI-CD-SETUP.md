# CI/CD Setup

SpringBoard uses Vercel for automatic deployment.

## Deployment

Every push to main branch automatically deploys to:
https://springboard-pink.vercel.app

## Setup Steps

1. Import repository to Vercel
2. Set Root Directory to springboard-ui
3. Add environment variables:
   - WATSONX_API_KEY
   - WATSONX_PROJECT_ID
   - WATSONX_URL=https://us-south.ml.cloud.ibm.com
4. Deploy

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| WATSONX_API_KEY | Yes for AI refactor | IBM Cloud API key |
| WATSONX_PROJECT_ID | Yes for AI refactor | watsonx.ai project ID |
| WATSONX_URL | Yes for AI refactor | https://us-south.ml.cloud.ibm.com |

Note: GitHub tokens are provided by users at runtime.
They are never stored server side.