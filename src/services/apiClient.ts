const API_BASE_URL = import.meta.env.DEV
  ? "/spider-api"
  : "https://vitjcj3t5f.execute-api.us-east-2.amazonaws.com";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function buildUrl(path: string, query: Record<string, string>) {
  const endpoint = `${API_BASE_URL}${path}`;
  const url = new URL(endpoint, window.location.origin);
  Object.entries(query).forEach(([key, value]) => {
    if (value.trim().length > 0) {
      url.searchParams.set(key, value.trim());
    }
  });
  return url;
}

export async function fetchJson<T>(
  path: string,
  query: Record<string, string>,
): Promise<T> {
  const url = buildUrl(path, query);
  const response = await fetch(url.toString());

  if (!response.ok) {
    let detail = `Error ${response.status}`;
    try {
      const errorBody = (await response.json()) as { detail?: string };
      if (typeof errorBody.detail === "string") {
        detail = errorBody.detail;
      }
    } catch {
      // Ignore parsing failure and keep default detail.
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}
