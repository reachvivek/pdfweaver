import { useState, useCallback } from 'react';
import { FileListItem } from './file-list-item';
import type { FileItem } from '@/types';

interface FileListProps {
  items: FileItem[];
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

export function FileList({ items, onRemove, onReorder }: FileListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (toIndex: number) => {
      if (dragIndex !== null && dragIndex !== toIndex) {
        onReorder(dragIndex, toIndex);
      }
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, onReorder],
  );

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-muted-foreground">
          {items.length} file{items.length !== 1 ? 's' : ''} - drag to reorder
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <FileListItem
            key={item.id}
            item={item}
            index={i}
            onRemove={onRemove}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragTarget={dragOverIndex === i && dragIndex !== i}
          />
        ))}
      </div>
    </div>
  );
}
