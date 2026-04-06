import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface PdfPreviewProps {
  blob: Blob;
}

export function PdfPreview({ blob }: PdfPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {url && (
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          title="Merged PDF Preview"
          className="w-full flex-1 border-0 bg-white"
        />
      )}
    </Card>
  );
}
