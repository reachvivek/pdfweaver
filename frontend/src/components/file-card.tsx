import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { usePdfThumbnail } from '@/hooks/use-pdf-thumbnail';
import type { FileItem } from '@/types';

interface FileCardProps {
  item: FileItem;
  index: number;
  onRemove: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragTarget: boolean;
}

function getExtension(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function getPageLabel(isPdf: boolean, isImage: boolean, pageCount: number, ext: string) {
  if (isPdf && pageCount > 0) return `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`;
  if (isImage) return '1 page';
  return ext.toUpperCase();
}

function truncateName(name: string, max = 20) {
  if (name.length <= max) return name;
  const ext = name.split('.').pop() ?? '';
  const base = name.slice(0, max - ext.length - 4);
  return `${base}...${ext}`;
}

export function FileCard({
  item,
  index,
  onRemove,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  isDragTarget,
}: FileCardProps) {
  const ext = getExtension(item.file.name);
  const isPdf = ext === 'pdf';
  const isImage = item.file.type.startsWith('image/');

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(item.file);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [item.file, isImage]);

  const { thumbnail: pdfThumbnail, pageCount } = usePdfThumbnail(item.file);
  const thumbnail = isPdf ? pdfThumbnail : imagePreview;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(index);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnter(index);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      className={`
        group relative flex flex-col items-center
        transition-all duration-200 ease-out
        cursor-grab active:cursor-grabbing select-none
        ${isDragging ? 'opacity-30 scale-95' : ''}
        ${isDragTarget ? 'scale-105' : ''}
      `}
    >
      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center
          rounded-full bg-foreground text-background shadow-md
          opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer
          hover:bg-destructive hover:text-white"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Thumbnail */}
      <div
        className={`
          relative h-[30vh] max-h-56 w-[22vh] max-w-40 sm:h-52 sm:w-40 sm:max-h-none sm:max-w-none md:h-64 md:w-48
          overflow-hidden rounded-lg border-2 bg-white shadow-sm
          transition-all duration-200
          group-hover:shadow-lg group-hover:-translate-y-1
          ${isDragTarget
            ? 'border-primary shadow-xl ring-4 ring-primary/20 -translate-y-2'
            : 'border-border'}
        `}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.file.name}
            className="h-full w-full object-contain pointer-events-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
            <span className="text-2xl sm:text-3xl font-bold uppercase text-muted-foreground/30">{ext}</span>
          </div>
        )}

        {/* Page count badge */}
        <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 rounded bg-foreground/80 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-background">
          {getPageLabel(isPdf, isImage, pageCount, ext)}
        </div>
      </div>

      {/* Filename */}
      <p className="mt-1.5 sm:mt-2 max-w-[112px] sm:max-w-[160px] md:max-w-[192px] text-center text-[10px] sm:text-xs font-medium text-foreground truncate pointer-events-none">
        {truncateName(item.file.name)}
      </p>
    </div>
  );
}
