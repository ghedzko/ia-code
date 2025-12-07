export function formatAPIError(providerName: string, status: number, errorText: string): string {
  let errorMessage = `${providerName} API error: ${status} - ${errorText}`;
  
  // Try to parse and provide a more helpful message
  try {
    const errorJson = JSON.parse(errorText);
    if (errorJson.error?.message) {
      errorMessage = `${providerName} API error: ${status} - ${errorJson.error.message}`;
    }
  } catch {
    // If parsing fails, use the raw error text
  }
  
  return errorMessage;
}

