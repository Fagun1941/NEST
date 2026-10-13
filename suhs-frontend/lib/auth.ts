export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('accessToken');
}

export function saveAccessToken(token: string): void {
  // localStorage is convenient for this learning project, but JavaScript-accessible
  // tokens are vulnerable to theft if the site has an XSS vulnerability.
  localStorage.setItem('accessToken', token);
}

export function clearAccessToken(): void {
  localStorage.removeItem('accessToken');
}