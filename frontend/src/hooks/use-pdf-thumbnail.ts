import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfMeta {
  thumbnail: string | null;
  pageCount: number;
}

export function usePdfThumbnail(file: File): PdfMeta {
  const [meta, setMeta] = useState<PdfMeta>({ thumbnail: null, pageCount: 0 });

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const page = await pdf.getPage(1);

        const scale = 400 / page.getViewport({ scale: 1 }).width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

        if (!cancelled) {
          setMeta({
            thumbnail: canvas.toDataURL('image/png'),
            pageCount: pdf.numPages,
          });
        }
      } catch {
        if (!cancelled) setMeta({ thumbnail: null, pageCount: 0 });
      }
    }

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      render();
    }

    return () => { cancelled = true; };
  }, [file]);

  return meta;
}
