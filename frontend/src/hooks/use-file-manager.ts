import { useState, useCallback } from 'react';
import type { FileItem } from '@/types';

const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'];

function getExtension(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function isAllowed(file: File) {
  return ALLOWED_EXTENSIONS.includes(getExtension(file.name));
}

let counter = 0;
function makeId() {
  return `file-${++counter}-${Date.now()}`;
}

export function useFileManager() {
  const [items, setItems] = useState<FileItem[]>([]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter(isAllowed);
    const newItems = incoming.map((file) => ({ id: makeId(), file }));
    setItems((prev) => [...prev, ...newItems]);
    return incoming.length;
  }, []);

  const removeFile = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  return { items, addFiles, removeFile, reorder, clearAll };
}
