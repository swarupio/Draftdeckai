'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global error boundary for uncaught errors at the application level
 * This catches errors that occur outside of specific page/layout error boundaries
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
    
    // In production, you might want to send this to a monitoring service
    // Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none"></div>
          
          <div className="w-full max-w-md relative z-10">
            <div className="glass-effect p-8 rounded-2xl shadow-2xl border border-red-500/20 text-center space-y-6 backdrop-blur-xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h1 className="modern-display text-3xl font-bold text-shadow-professional">
                  System Error
                </h1>
                <p className="modern-body text-muted-foreground">
                  A critical system error occurred. We've been notified and are working on it.
                </p>
              </div>

              <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/10 mb-6">
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                  {process.env.NODE_ENV === 'development' 
                    ? (error.message || "An unexpected system error occurred")
                    : "A critical system error occurred. Please refresh the page or contact support."
                  }
                </p>
                {process.env.NODE_ENV === 'development' && error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => reset()}
                  className="bolt-gradient text-white font-semibold py-6 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Restart Application
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'} 
                  className="rounded-xl border-yellow-400/20 hover:bg-yellow-400/5"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </div>
              
              <div className="flex flex-col gap-2 pt-4 border-t border-yellow-400/10">
                <p className="text-xs text-muted-foreground">
                  If the problem persists, please <a href="/contact" className="text-indigo-600 hover:underline">contact support</a>
                </p>
                <p className="text-xs text-muted-foreground">
                  DraftDeckAI Premium Experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}