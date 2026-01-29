const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 2;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchStudioData = async ({ timeout = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_BASE_URL}/studio/`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Studio API responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError =
        error.name === "AbortError"
          ? new Error("Studio request timed out. Please try again.")
          : error;

      if (attempt < retries) {
        await delay(800 * (attempt + 1));
      }
    }
  }

  console.error("Failed to fetch studio data:", lastError);
  throw lastError ?? new Error("Unable to load studio data");
};

export const submitContactMessage = async (
  payload,
  { timeout = DEFAULT_TIMEOUT_MS } = {}
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}/contact/`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Contact API responded with ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // Ignore JSON parse failures and fall back to generic error
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Contact request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};