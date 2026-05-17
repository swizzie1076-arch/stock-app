import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";

export const metadata: Metadata = {
  title: "Atlas Invest",
  description: "A stock research and portfolio cockpit powered by Convex and server-routed market data."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ClerkProvider
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
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
