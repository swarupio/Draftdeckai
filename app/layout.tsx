import "./globals.css";
import type { ReactNode } from "react";
import Footer from "@/components/ui/Footer";
import { Inter, Poppins } from "next/font/google";
import { Providers } from "./providers";
import { CursorProvider } from "@phazr/custom-cursor";
import { PWABanner } from "@/components/pwa-banner";
import { FeedbackPopup } from "@/components/feedback-popup";
import { DeploymentStatusBanner } from "@/components/deployment-status-banner";
import type { Metadata } from "next";
import PlausibleProvider from 'next-plausible';
import { UTMTracker } from '@/components/utm-tracker';

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "DraftDeckAI - AI Document Creation Platform",
  description: "Create beautiful resumes, presentations, CVs and letters with AI",
};

const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=document.documentElement;if(s==='dark'){d.classList.add('dark');}else if(s==='light'){d.classList.remove('dark');}else{if(window.matchMedia('(prefers-color-scheme: dark)').matches){d.classList.add('dark');}else{d.classList.remove('dark');}}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <PlausibleProvider 
          domain="draftdeckai.com"
          src="https://plausible.io/js/script.tagged-events.outbound-links.js"
        />
      </head>
      <body className={`${inter.className} ${poppins.variable}`}>
        <UTMTracker />
        <DeploymentStatusBanner />
        <Providers>
          <CursorProvider>
            {children}
            <PWABanner />
            <FeedbackPopup />
            <Footer />
          </CursorProvider>
        </Providers>
      </body>
    </html>
  );
}