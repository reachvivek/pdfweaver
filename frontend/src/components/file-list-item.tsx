import { GripVertical, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FilePreviewThumbnail } from './file-preview-thumbnail';
import type { FileItem } from '@/types';

interface FileListItemProps {
  item: FileItem;
  index: number;
  onRemove: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  isDragTarget: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export function FileListItem({
  item,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragTarget,
}: FileListItemProps) {
  const ext = getExtension(item.file.name);
  const isPdf = ext === 'pdf';

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      className={`
        group flex items-center gap-3 rounded-lg border bg-card p-3
        transition-all duration-150 ease-out
        cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-primary/30
        ${isDragTarget ? 'border-primary border-t-2 bg-primary/5 shadow-md' : 'border-border'}
      `}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />

      <FilePreviewThumbnail file={item.file} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
        <p className="text-xs text-muted-foreground">{formatSize(item.file.size)}</p>
      </div>

      <Badge
        variant={isPdf ? 'destructive' : 'secondary'}
        className="shrink-0 text-[10px] uppercase tracking-wider"
      >
        {ext}
      </Badge>

      <button
        onClick={() => onRemove(item.id)}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground/40 transition-all
          hover:bg-destructive/10 hover:text-destructive hover:scale-110
          opacity-0 group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
