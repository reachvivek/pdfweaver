import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onFiles: (files: FileList) => void;
}

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.webp';

export function FileDropzone({ onFiles }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
    },
    [onFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        onFiles(e.target.files);
        e.target.value = '';
      }
    },
    [onFiles],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`
        group relative cursor-pointer rounded-xl border-2 border-dashed
        p-8 sm:p-10 transition-all duration-200 text-center
        ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        <div
          className={`rounded-full p-3 sm:p-4 transition-colors ${
            isDragging ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:text-primary'
          }`}
        >
          <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>

        <div>
          <p className="text-sm sm:text-base font-medium text-foreground">
            Drop files here or{' '}
            <span className="text-primary underline underline-offset-4">browse</span>
          </p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            PDF, PNG, JPG, JPEG, BMP, TIFF, WEBP
          </p>
        </div>
      </div>
    </div>
  );
}
