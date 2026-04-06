import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProcessingOverlayProps {
  isProcessing: boolean;
}

export function ProcessingOverlay({ isProcessing }: ProcessingOverlayProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 93) return 93; // hold at 93% until actual completion
        const increment = prev < 50 ? 8 : prev < 80 ? 4 : 1;
        return Math.min(prev + increment, 93);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isProcessing]);

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="flex flex-col items-center gap-5 p-8">
          <h2 className="text-xl font-semibold text-foreground">Processing your document...</h2>

          {/* Progress bar */}
          <div className="w-full">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-center text-sm font-medium text-muted-foreground">{progress}%</p>
          </div>

          {/* Spinner dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
