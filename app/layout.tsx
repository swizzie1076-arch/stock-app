import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { AuthStateProvider } from "@/components/auth-state-provider";
import { PwaRegister } from "@/components/pwa-register";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export const metadata: Metadata = {
  title: "Atlas Invest",
  description: "A stock research and portfolio cockpit powered by Convex and server-routed market data.",
  manifest: "/manifest.json",
  applicationName: "Atlas Invest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Atlas Invest"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: "#05080d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const app = (
    <AuthStateProvider clerkEnabled={Boolean(clerkPublishableKey)}>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </AuthStateProvider>
  );

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {clerkPublishableKey ? (
          <ClerkProvider
            publishableKey={clerkPublishableKey}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: "#0f8a8a",
                borderRadius: "0.5rem"
              },
              elements: {
                cardBox: "shadow-none",
                card: "border border-[#dfe7ec]",
                formButtonPrimary: "bg-[#102a2c] hover:bg-[#173b3e]"
              }
            }}
          >
            {app}
          </ClerkProvider>
        ) : (
          app
        )}
        <PwaRegister />
        <MobileBottomNav />
      </body>
    </html>
  );
}
