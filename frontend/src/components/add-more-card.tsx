import { useRef } from 'react';
import { Plus } from 'lucide-react';

interface AddMoreCardProps {
  onFiles: (files: FileList) => void;
}

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.webp';

export function AddMoreCard({ onFiles }: AddMoreCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => inputRef.current?.click()}
        className="flex h-[30vh] max-h-56 w-[22vh] max-w-40 sm:h-52 sm:w-40 sm:max-h-none sm:max-w-none md:h-64 md:w-48
          flex-col items-center justify-center gap-2 sm:gap-3
          rounded-lg border-2 border-dashed border-muted-foreground/25
          bg-background transition-all duration-200 cursor-pointer
          hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm
          active:scale-95"
      >
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </div>
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Add more files</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        onChange={(e) => {
          if (e.target.files?.length) {
            onFiles(e.target.files);
            e.target.value = '';
          }
        }}
        className="hidden"
      />
    </div>
  );
}
