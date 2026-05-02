// IBM watsonx.ai integration for AI-powered code refactoring

const WATSONX_URL = 'https://us-south.ml.cloud.ibm.com'
const MODEL_ID = 'ibm/granite-3-8b-instruct'
const API_VERSION = '2023-05-29'

async function getIAMToken(apiKey: string): Promise<string> {
  const response = await fetch(
    'https://iam.cloud.ibm.com/identity/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: apiKey,
      }).toString(),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('[IAM] Failed:', response.status, error)
    throw new Error('Failed to get IAM token: ' + response.status)
  }

  const data = await response.json()
  console.log('[IAM] Token obtained successfully')
  return data.access_token
}

async function callGranite(
  prompt: string, 
  iamToken: string,
  projectId: string
): Promise<string> {
  
  const endpoint = WATSONX_URL + '/ml/v1/text/generation?version=' + API_VERSION
  
  const requestBody = {
    model_id: MODEL_ID,
    input: prompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: 2000,
      min_new_tokens: 1,
      stop_sequences: [],
      repetition_penalty: 1,
    },
    project_id: projectId,
  }

  console.log('[Granite] Calling endpoint:', endpoint)
  console.log('[Granite] Model:', MODEL_ID)
  console.log('[Granite] Project ID (first 8):', projectId.substring(0, 8))
  console.log('[Granite] Request body keys:', Object.keys(requestBody))

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + iamToken,
    },
    body: JSON.stringify(requestBody),
  })

  console.log('[Granite] Response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Granite] Error response:', errorText)
    if (response.status === 404) {
      throw new Error('IBM watsonx.ai project not found (404). Error: ' + errorText)
    }
    throw new Error('Granite API error ' + response.status + ': ' + errorText)
  }

  const data = await response.json()
  const generatedText = data.results?.[0]?.generated_text || ''
  console.log('[Granite] Generated text length:', generatedText.length)
  return generatedText
}

export async function refactorWithWatsonx(
  content: string,
  fileType: 'pom' | 'java' | 'dockerfile' | 'properties',
  watsonxApiKey?: string
): Promise<string> {
  
  const apiKey = watsonxApiKey || process.env.WATSONX_API_KEY
  const projectId = process.env.WATSONX_PROJECT_ID
  
  console.log('[Watsonx] API Key exists:', !!apiKey)
  console.log('[Watsonx] API Key length:', apiKey?.length)
  console.log('[Watsonx] Project ID exists:', !!projectId)
  console.log('[Watsonx] Project ID:', projectId)
  console.log('[Watsonx] Project ID length:', projectId?.length)
  
  if (!apiKey) {
    throw new Error('WATSONX_API_KEY is not configured')
  }
  
  if (!projectId) {
    throw new Error('WATSONX_PROJECT_ID is not configured')
  }

  const iamToken = await getIAMToken(apiKey)
  
  let prompt = ''
  
  if (fileType === 'pom') {
    prompt = `You are a Spring Boot migration expert.
Modernize this pom.xml from Spring Boot 2.x to Spring Boot 3.1.5.
Change Java version to 17.
Update all deprecated dependencies.
Return ONLY the complete updated pom.xml content.
No explanation. No markdown. Just the raw XML.

${content}`
  } else if (fileType === 'java') {
    prompt = `You are a Spring Boot migration expert.
Modernize this Java file from Spring Boot 2.x to Spring Boot 3.x.
Replace all javax.* imports with jakarta.*
Fix all deprecated Spring Boot 2 annotations.
Add Javadoc to all public methods.
Return ONLY the complete updated Java file.
No explanation. No markdown. Just the raw Java code.

${content}`
  } else if (fileType === 'dockerfile') {
    prompt = `Update this Dockerfile for Java 17 and Spring Boot 3.
Change base image to eclipse-temurin:17-jdk-alpine.
Return ONLY the updated Dockerfile content.
No explanation. No markdown.

${content}`
  } else {
    prompt = `Update this Spring Boot application.properties file 
for Spring Boot 3.x compatibility.
Return ONLY the updated properties file content.
No explanation. No markdown.

${content}`
  }

  return await callGranite(prompt, iamToken, projectId)
}

// Made with Bob
