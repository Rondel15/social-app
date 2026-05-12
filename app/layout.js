import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/layout/SessionProvider";
import { Toaster } from "react-hot-toast";

export const metadata = { title: "SocialApp", description: "Connect with friends" };

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface text-soft font-sans">
        <SessionProvider session={session}>
          {children}
          <Toaster position="bottom-right" toastOptions={{ style: { background: "#1a1a24", color: "#e2e2f0", border: "1px solid #2a2a38" } }} />
        </SessionProvider>
      </body>
    </html>
  );
}
