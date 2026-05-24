'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home, HelpCircle, ArrowLeft } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { logError } = useErrorHandler();
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [isDeploymentError, setIsDeploymentError] = useState(false);

  useEffect(() => {
    console.error('Application Error:', error);
    
    // Check if this is a deployment-related error
    const errorMessage = error?.message || '';
    const isDeployment = errorMessage.includes('DEPLOYMENT_NOT_FOUND') || 
                         errorMessage.includes('deployment') ||
                         errorMessage.includes('503') ||
                         errorMessage.includes('504');
    
    setIsDeploymentError(isDeployment);
    setErrorDetails(errorMessage);

    // Log to monitoring service
    logError({
      message: errorMessage,
      stack: error?.stack,
      digest: error?.digest,
      timestamp: Date.now(),
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    });
  }, [error, logError]);

  const handleRetry = () => {
    // Clear any cached data before retry
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    reset();
  };

  return (
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
              {isDeploymentError ? "Service Unavailable" : "Oops! Something went wrong"}
            </h1>
            <p className="modern-body text-muted-foreground">
              {isDeploymentError
                ? "We're experiencing deployment issues. Our team is working to restore service."
                : "We encountered an unexpected error. Don't worry, your data is safe."}
            </p>
          </div>

          <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/10 mb-6 text-left">
            <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
              {process.env.NODE_ENV === 'development' && errorDetails
                ? errorDetails
                : "A system error occurred. Please try again or contact support if the issue persists."
              }
            </p>
            {process.env.NODE_ENV === 'development' && error?.digest && (
              <p className="text-xs text-red-500 mt-2">Error ID: {error.digest}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={handleRetry}
              className="bolt-gradient text-white font-semibold py-6 rounded-xl hover:scale-105 transition-all duration-300"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button variant="outline" asChild className="rounded-xl border-yellow-400/20 hover:bg-yellow-400/5">
                <Link href="/auth/signin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-xl border-yellow-400/20 hover:bg-yellow-400/5">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-red-500/10 flex justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/contact" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
              <HelpCircle className="w-3 h-3" /> Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}