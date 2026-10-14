
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function api(path, body, method = 'POST') {
  const isLogin = path === 'auth/login';
  const attempts = isLogin ? 2 : 1;

  for (let attempt = 0; attempt < attempts; attempt++) {
    let response;

    try {
      response = await fetch(`/api/${path}`, {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {})
        },
        ...(body ? { method, body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(25000)
      });
    } catch {
      if (isLogin && attempt === 0) {
        await wait(1500);
        continue;
      }
      throw new Error(
        'The server is unavailable. Please try again in a moment.'
      );
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      if (isLogin && attempt === 0) {
        await wait(1500);
        continue;
      }
      throw new Error(
        'The server is temporarily unavailable. Please retry.'
      );
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error('The server returned an incomplete response. Please retry.');
    }

    if (!response.ok) {
      if (response.status === 401 && !path.startsWith('auth/')) {
        globalThis.dispatchEvent?.(new Event('haven:unauthorized'));
      }
      throw new Error(result.message || 'Unable to complete this request.');
    }

    return result;
  }

  throw new Error('The server is unavailable. Please try again in a moment.');
}
