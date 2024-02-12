"use client"
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import WalletContextProvider from "@/common/WalletContextProvider";
import NetworkContextProvider from "@/common/NetworkContextProvider";
import { ThemeProvider } from "@/components/layouts/theme-provider";

export const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    <NetworkContextProvider>
      <WalletContextProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header></Header>
          <div className="lg:max-w-screen-lg mx-auto">
            {children}
          </div>
          <Footer></Footer>
        </ThemeProvider>
      </WalletContextProvider>
    </NetworkContextProvider>
  );
}