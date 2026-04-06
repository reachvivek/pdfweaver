import { useState, useCallback, useRef } from 'react';
import { Info } from 'lucide-react';
import { FileCard } from './file-card';
import { PlusSpacer } from './plus-spacer';
import { AddMoreCard } from './add-more-card';
import type { FileItem } from '@/types';

interface FileGridProps {
  items: FileItem[];
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onAddMore: (files: FileList) => void;
}

export function FileGrid({ items, onRemove, onReorder, onAddMore }: FileGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragOverTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    clearTimeout(dragOverTimeout.current);
    dragOverTimeout.current = setTimeout(() => {
      setDragOverIndex(index);
    }, 50);
  }, []);

  const handleDragEnd = useCallback(() => {
    clearTimeout(dragOverTimeout.current);
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      onReorder(dragIndex, dragOverIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, dragOverIndex, onReorder]);

  return (
    <div className="flex flex-col gap-3">
      {/* Instruction banner */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
        <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          Drag & drop to rearrange. Left = first page.
        </p>
      </div>

      {/* Card grid */}
      <div className="flex flex-wrap items-start justify-center gap-y-4 px-1 sm:px-2">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-start">
            {i > 0 && <PlusSpacer />}
            <FileCard
              item={item}
              index={i}
              onRemove={onRemove}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
              isDragging={dragIndex === i}
              isDragTarget={dragOverIndex === i && dragIndex !== i}
            />
          </div>
        ))}

        {items.length > 0 && <PlusSpacer />}
        <AddMoreCard onFiles={onAddMore} />
      </div>
    </div>
  );
}
