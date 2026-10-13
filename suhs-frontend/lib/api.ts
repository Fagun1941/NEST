const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = data.message;
    if (Array.isArray(message)) {
      return message
        .filter((item): item is string => typeof item === 'string')
        .join(', ');
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const responseText = await response.text();
  let data: unknown = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText) as unknown;
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, `Request failed with status ${response.status}`),
      response.status,
    );
  }

  return data as T;
}
