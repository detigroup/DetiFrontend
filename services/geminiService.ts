
/**
 * Gemini (Google GenAI) service
 * - Avoid initializing the SDK at module load to prevent runtime errors in the browser
 *   when an API key is not provided.
 * - Dynamically import the SDK only when an API key is available (server or env).
 */
type MaybeResponse = { text?: string } | string;

const getApiKey = () => {
  // Try common places for the API key. Vite apps often expose VITE_* env vars to the client.
  // Prefer server-side keys; if no key is present, we will early-return a placeholder.
  const fromImportMeta = (import.meta as any)?.env?.VITE_GEMINI_API_KEY || (import.meta as any)?.env?.VITE_API_KEY;
  const fromProcess = typeof process !== 'undefined' ? (process.env?.API_KEY || process.env?.GEMINI_API_KEY) : undefined;
  return fromImportMeta || fromProcess || undefined;
};

export const getMarketInsight = async (query: string, contextData: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    // No API key available — return a safe placeholder to avoid runtime exceptions in browser.
    // Log once to help debugging.
    if ((import.meta as any).env?.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('Gemini API key not set. getMarketInsight will return a placeholder response.');
    }
    return 'DETI AI: Feature temporarily disabled in this build.';
  }

  try {
    // Dynamically import the SDK so bundlers don't execute it at module load in the browser.
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const model = 'gemini-2.5-flash';
    const systemPrompt = `You are DETI AI, a specialized crypto market analyst for the DETI CEX platform.\nKeep responses concise, professional, and data-driven.\nUse the provided market context data to answer the user's question.\nFormat your response in simple markdown.\nAvoid financial advice disclaimers in every single message, but be responsible.\nCurrent Market Context: ${contextData}`;

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: { systemInstruction: systemPrompt }
    });

    // response may be an object or string depending on SDK version
    const text = (response as any)?.text ?? (response as any);
    return text || "I couldn't generate an insight at this moment.";
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Gemini API Error:', error);
    return 'Analyzing market data... (Simulation: Connection to AI momentarily disrupted)';
  }
};
