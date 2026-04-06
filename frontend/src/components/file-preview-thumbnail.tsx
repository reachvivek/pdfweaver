import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

interface FilePreviewThumbnailProps {
  file: File;
}

export function FilePreviewThumbnail({ file }: FilePreviewThumbnailProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const isImage = file.type.startsWith('image/');

  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  if (isImage && preview) {
    return (
      <img
        src={preview}
        alt={file.name}
        className="h-9 w-9 shrink-0 rounded-md border object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-50 dark:bg-red-950/30">
      <FileText className="h-4 w-4 text-red-500" />
    </div>
  );
}
