import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header"; // Ensure Header is compatible or wrapped
import Footer from "@/components/Footer"; // Ensure Footer is compatible or wrapped

export const metadata: Metadata = {
    title: "Fusion Starter",
    description: "Starter project",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-1 pt-20">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
