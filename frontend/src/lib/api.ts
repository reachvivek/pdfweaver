const API_URL = import.meta.env.VITE_API_URL || '';

async function handleError(res: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const err = await res.json();
      message = err.error || err.detail || fallback;
    }
  } catch {
    // ignore parse errors
  }
  throw new Error(message);
}

export async function mergeFiles(files: File[]): Promise<Blob> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const res = await fetch(`${API_URL}/api/merge`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) await handleError(res, 'Merge failed');

  return res.blob();
}

export async function mergeAndEmail(files: File[], email: string): Promise<void> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('email', email);

  const res = await fetch(`${API_URL}/api/merge-and-email`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) await handleError(res, 'Failed to send email');
}
