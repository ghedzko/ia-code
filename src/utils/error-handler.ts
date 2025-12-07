import chalk from "chalk";
import * as p from "@clack/prompts";

export interface APIError {
  status: number;
  message: string;
  type?: string;
  code?: string;
}

export function parseAPIError(error: unknown): APIError | null {
  if (error instanceof Error) {
    const message = error.message;
    
    // Try to parse DeepSeek/OpenAI/Grok style errors
    // Format: "Provider API error: 402 - Insufficient Balance" or "Provider API error: 402 - {...json...}"
    const apiErrorMatch = message.match(/(\w+) API error: (\d+) - (.+)/);
    if (apiErrorMatch) {
      const [, provider, statusStr, errorBody] = apiErrorMatch;
      const status = parseInt(statusStr, 10);
      
      // Try to parse as JSON first
      try {
        const errorJson = JSON.parse(errorBody);
        return {
          status,
          message: errorJson.error?.message || errorJson.message || errorBody,
          type: errorJson.error?.type,
          code: errorJson.error?.code,
        };
      } catch {
        // If not JSON, use the error body directly as the message
        return {
          status,
          message: errorBody.trim(),
        };
      }
    }
  }
  
  return null;
}

export function getFriendlyErrorMessage(error: unknown): string {
  const apiError = parseAPIError(error);
  
  if (apiError) {
    switch (apiError.status) {
      case 401:
        return chalk.red(`❌ Authentication failed. Please check your API key in your environment variables (IA_*_API_KEY).`);
      case 402:
        return chalk.yellow(`⚠️  Insufficient balance. Your API account doesn't have enough credits. Please add funds to your account.`);
      case 403:
        return chalk.red(`❌ Access forbidden. Check your API key permissions.`);
      case 429:
        return chalk.yellow(`⚠️  Rate limit exceeded. Please wait a moment and try again.`);
      case 500:
      case 502:
      case 503:
        return chalk.yellow(`⚠️  Service temporarily unavailable. Please try again later.`);
      default:
        return chalk.red(`❌ API Error (${apiError.status}): ${apiError.message}`);
    }
  }
  
  if (error instanceof Error) {
    return chalk.red(`❌ Error: ${error.message}`);
  }
  
  return chalk.red(`❌ Unknown error: ${String(error)}`);
}

export function handleAPIError(error: unknown, context: string = "Operation"): void {
  const friendlyMessage = getFriendlyErrorMessage(error);
  p.log.error(friendlyMessage);
  
  const apiError = parseAPIError(error);
  if (apiError?.status === 402) {
    p.note(
      chalk.blue("💡 Tip: You can switch to another provider by setting IA_PROVIDER environment variable:\n") +
      chalk.gray("  export IA_PROVIDER=grok\n") +
      chalk.gray("  export IA_PROVIDER=openai\n") +
      chalk.gray("  export IA_PROVIDER=anthropic\n") +
      chalk.gray("  export IA_PROVIDER=google")
    );
  }
}

