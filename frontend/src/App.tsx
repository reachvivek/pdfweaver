import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Merge, Trash2, Mail, Download, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { FileDropzone } from '@/components/file-dropzone';
import { FileGrid } from '@/components/file-grid';
import { PdfPreview } from '@/components/pdf-preview';
import { EmailDialog } from '@/components/email-dialog';
import { ProcessingOverlay } from '@/components/processing-overlay';
import { useFileManager } from '@/hooks/use-file-manager';
import { mergeFiles, mergeAndEmail } from '@/lib/api';
import { sanitizeFileName } from '@/lib/sanitize';

type View = 'upload' | 'arrange' | 'result';

export default function App() {
  const { items, addFiles, removeFile, reorder, clearAll } = useFileManager();
  const [merging, setMerging] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [fileName, setFileName] = useState('merged');

  const view: View = mergedBlob ? 'result' : items.length > 0 ? 'arrange' : 'upload';

  const handleAddFiles = useCallback(
    (fileList: FileList) => {
      const count = addFiles(fileList);
      if (count > 0) {
        toast.success(`Added ${count} file${count > 1 ? 's' : ''}`);
        setMergedBlob(null);
      }
    },
    [addFiles],
  );

  const handleMerge = useCallback(async () => {
    if (items.length === 0) return;
    setMerging(true);
    setMergedBlob(null);

    try {
      const blob = await mergeFiles(items.map((i) => i.file));
      setMergedBlob(blob);
      toast.success('Files merged successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Merge failed');
    } finally {
      setMerging(false);
    }
  }, [items]);

  const handleDownload = useCallback(() => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'merged'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download started');
  }, [mergedBlob, fileName]);

  const handleEmail = useCallback(
    async (email: string) => {
      if (items.length === 0) return;
      setEmailLoading(true);
      try {
        await mergeAndEmail(items.map((i) => i.file), email);
        toast.success(`PDF sent to ${email}`);
        setEmailOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to send email');
      } finally {
        setEmailLoading(false);
      }
    },
    [items],
  );

  const handleClear = useCallback(() => {
    clearAll();
    setMergedBlob(null);
  }, [clearAll]);

  const handleStartOver = useCallback(() => {
    clearAll();
    setMergedBlob(null);
    setFileName('merged');
  }, [clearAll]);

  const fileSizeKB = mergedBlob ? (mergedBlob.size / 1024).toFixed(1) : '0';
  const fileSizeMB = mergedBlob ? (mergedBlob.size / (1024 * 1024)).toFixed(2) : '0';
  const fileSizeDisplay = mergedBlob && mergedBlob.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <ProcessingOverlay isProcessing={merging} />

      {/* ── RESULT VIEW ── */}
      {view === 'result' && mergedBlob ? (
        <div className="flex h-full flex-col md:flex-row">
          {/* Left: PDF preview */}
          <div className="flex-1 min-w-0 min-h-0 bg-muted/20 p-3 sm:p-4">
            <PdfPreview blob={mergedBlob} />
          </div>

          {/* Right: Controls panel */}
          <div className="w-full md:w-80 shrink-0 flex flex-col border-t md:border-t-0 md:border-l bg-background max-h-[45vh] md:max-h-none overflow-auto">
            {/* Header */}
            <div className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="mb-2 sm:mb-3 inline-flex items-center gap-2 rounded-full border bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Merge complete
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Your PDF is ready
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {items.length} file{items.length === 1 ? '' : 's'} merged
              </p>
            </div>

            <Separator />

            {/* File info */}
            <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
              {/* Filename input */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <Label htmlFor="filename" className="text-xs font-medium text-muted-foreground">
                  File name
                </Label>
                <div className="flex items-center gap-0">
                  <Input
                    id="filename"
                    value={fileName}
                    onChange={(e) => setFileName(sanitizeFileName(e.target.value))}
                    placeholder="merged"
                    maxLength={100}
                    className="rounded-r-none border-r-0 text-sm"
                  />
                  <div className="flex h-8 items-center rounded-r-lg border border-l-0 bg-muted px-2.5 text-xs text-muted-foreground">
                    .pdf
                  </div>
                </div>
              </div>

              {/* File details card */}
              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {fileName || 'merged'}.pdf
                    </p>
                    <p className="text-xs text-muted-foreground">{fileSizeDisplay}</p>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Actions */}
              <div className="flex flex-row md:flex-col gap-2 sm:gap-2.5">
                <Button size="lg" className="flex-1 md:w-full" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" className="flex-1 md:w-full" onClick={() => setEmailOpen(true)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>

            {/* Bottom: start over */}
            <div className="mt-auto border-t p-3 sm:p-4">
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleStartOver}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Start over
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── UPLOAD + ARRANGE VIEWS ── */
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 sm:px-6 py-3 sm:py-6">
          {/* Header */}
          <div className="mb-2 sm:mb-4 text-center shrink-0">
            <div className="mb-1 sm:mb-2 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <Merge className="h-3 w-3" />
              PDFWeaver
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
              Merge your documents
            </h1>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-muted-foreground">
              {view === 'upload' && 'Upload PDFs and images to combine them into a single PDF.'}
              {view === 'arrange' && 'Arrange your files, then merge.'}
            </p>
          </div>

          {/* Upload */}
          {view === 'upload' && (
            <div className="mx-auto flex flex-1 items-center max-w-xl w-full">
              <div className="w-full">
                <FileDropzone onFiles={handleAddFiles} />
              </div>
            </div>
          )}

          {/* Arrange */}
          {view === 'arrange' && (
            <div className="flex flex-1 flex-col gap-3 sm:gap-4 min-h-0">
              <div className="flex-1 min-h-0 overflow-auto">
                <FileGrid
                  items={items}
                  onRemove={removeFile}
                  onReorder={reorder}
                  onAddMore={handleAddFiles}
                />
              </div>

              <Separator className="shrink-0" />

              <div className="flex items-center justify-between shrink-0">
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Clear all</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEmailOpen(true)} className="sm:size-default">
                    <Mail className="mr-1.5 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Merge & Email</span>
                    <span className="sm:hidden">Email</span>
                  </Button>
                  <Button onClick={handleMerge} size="lg">
                    <Merge className="mr-1.5 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Merge PDF</span>
                    <span className="sm:hidden">Merge</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-auto pt-2 text-center shrink-0">
            <p className="text-[10px] text-muted-foreground/40">
              Developed by{' '}
              <a
                href="https://linkedin.com/in/reachvivek"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-muted-foreground/60 transition-colors"
              >
                Vivek
              </a>
              {' '}&middot; &copy; {new Date().getFullYear()} &middot; Files are not stored.
            </p>
          </footer>
        </div>
      )}

      {/* Email Dialog */}
      <EmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onSend={handleEmail}
        isLoading={emailLoading}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
