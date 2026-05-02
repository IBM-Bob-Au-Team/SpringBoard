// IBM watsonx.ai integration for AI-powered code refactoring

interface IAMTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expiration: number;
}

interface WatsonxGenerationResponse {
  model_id: string;
  created_at: string;
  results: Array<{
    generated_text: string;
    generated_token_count: number;
    input_token_count: number;
    stop_reason: string;
  }>;
}

// Cache for IAM tokens (tokens last 60 minutes, we cache for 50)
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/**
 * Get IAM access token from IBM Cloud
 * Caches tokens for 50 minutes to avoid unnecessary API calls
 */
export async function getIAMToken(apiKey: string): Promise<string> {
  // Check cache first
  const cached = tokenCache.get(apiKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  try {
    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[IAM] Failed to get IAM token:', response.status, errorText);
      throw new Error(`Failed to get IAM token (${response.status}): ${response.statusText}`);
    }

    const data: IAMTokenResponse = await response.json();
    console.log('[IAM] Successfully obtained IAM token');

    // Cache token for 50 minutes (expires in 60)
    const expiresAt = Date.now() + 50 * 60 * 1000;
    tokenCache.set(apiKey, {
      token: data.access_token,
      expiresAt,
    });

    return data.access_token;
  } catch (error) {
    console.error('Error getting IAM token:', error);
    throw new Error('Failed to authenticate with IBM Cloud');
  }
}

/**
 * Call IBM Granite model via watsonx.ai API
 */
export async function callGranite(
  prompt: string,
  iamToken: string,
  projectId: string,
  watsonxUrl: string = 'https://us-south.ml.cloud.ibm.com'
): Promise<string> {
  try {
    // Debug logging
    const endpoint = `${watsonxUrl}/ml/v1/text/generation?version=2023-05-29`;
    console.log('[Granite] Calling Granite with model: ibm/granite-13b-instruct-v2');
    console.log('[Granite] Project ID set:', !!projectId);
    console.log('[Granite] Endpoint:', endpoint);
    console.log('[Granite] IAM token present:', !!iamToken);
    
    const requestBody = {
      model_id: 'ibm/granite-13b-instruct-v2',
      input: prompt,
      parameters: {
        decoding_method: 'greedy',
        max_new_tokens: 2000,
        min_new_tokens: 1,
        stop_sequences: [],
        repetition_penalty: 1,
      },
      project_id: projectId,
    };
    
    console.log('[Granite] Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${iamToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('[Granite] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Granite] Watsonx API error:', response.status, errorText);
      
      // Provide more specific error messages
      if (response.status === 401) {
        throw new Error('IBM watsonx.ai authentication failed (401). The IAM token is invalid or expired. Please check your API key.');
      } else if (response.status === 403) {
        throw new Error('IBM watsonx.ai access forbidden (403). Your API key does not have permission to access this project.');
      } else if (response.status === 404) {
        throw new Error('IBM watsonx.ai project not found (404). Please verify your project ID is correct.');
      } else if (response.status === 429) {
        throw new Error('IBM watsonx.ai rate limit exceeded (429). Please try again later or provide your own API key.');
      } else if (response.status === 400) {
        throw new Error(`IBM watsonx.ai bad request (400): ${errorText}. Check the request format.`);
      } else {
        throw new Error(`IBM watsonx.ai error (${response.status}): ${errorText || response.statusText}`);
      }
    }

    const data: WatsonxGenerationResponse = await response.json();
    console.log('[Granite] Response received, results count:', data.results?.length || 0);

    if (!data.results || data.results.length === 0) {
      console.error('[Granite] No results in response:', JSON.stringify(data));
      throw new Error('IBM Granite model returned no results. Please try again.');
    }

    const generatedText = data.results[0].generated_text.trim();
    console.log('[Granite] Generated text length:', generatedText.length);
    
    return generatedText;
  } catch (error) {
    console.error('[Granite] Error calling Granite model:', error);
    
    // Re-throw with original message if it's already a specific error
    if (error instanceof Error && error.message.includes('watsonx')) {
      throw error;
    }
    
    // Generic fallback error
    throw new Error('Failed to generate code with IBM Granite. Please check your API credentials and try again.');
  }
}

/**
 * Refactor pom.xml using IBM Granite
 */
export async function refactorPomXml(
  content: string,
  iamToken: string,
  projectId: string,
  watsonxUrl?: string
): Promise<string> {
  const prompt = `You are a Spring Boot migration expert.
Modernize this pom.xml from Spring Boot 2.x to 3.1.5.
Change Java version to 17.
Update all deprecated dependencies.
Return ONLY the complete updated pom.xml content.
No explanation, no markdown, just the raw XML.

Original pom.xml:
${content}

Updated pom.xml:`;

  return callGranite(prompt, iamToken, projectId, watsonxUrl);
}

/**
 * Refactor Java file using IBM Granite
 */
export async function refactorJavaFile(
  content: string,
  iamToken: string,
  projectId: string,
  watsonxUrl?: string
): Promise<string> {
  const prompt = `You are a Spring Boot migration expert.
Modernize this Java file from Spring Boot 2.x to 3.x.
Replace all javax.* imports with jakarta.*
Fix all deprecated Spring Boot 2 annotations.
Add Javadoc to all public methods.
Return ONLY the complete updated Java file.
No explanation, no markdown, just the raw Java code.

Original Java file:
${content}

Updated Java file:`;

  return callGranite(prompt, iamToken, projectId, watsonxUrl);
}

/**
 * Refactor Dockerfile using IBM Granite
 */
export async function refactorDockerfile(
  content: string,
  iamToken: string,
  projectId: string,
  watsonxUrl?: string
): Promise<string> {
  const prompt = `Update this Dockerfile for Java 17 and Spring Boot 3.
Change base image to eclipse-temurin:17-jdk-alpine.
Return ONLY the updated Dockerfile content.
No explanation, no markdown, just the raw Dockerfile.

Original Dockerfile:
${content}

Updated Dockerfile:`;

  return callGranite(prompt, iamToken, projectId, watsonxUrl);
}

/**
 * Refactor application.properties using IBM Granite
 */
export async function refactorProperties(
  content: string,
  iamToken: string,
  projectId: string,
  watsonxUrl?: string
): Promise<string> {
  const prompt = `Update this application.properties file for Spring Boot 3.
Fix any deprecated properties.
Return ONLY the updated properties file content.
No explanation, no markdown, just the raw properties.

Original application.properties:
${content}

Updated application.properties:`;

  return callGranite(prompt, iamToken, projectId, watsonxUrl);
}

// Made with Bob
