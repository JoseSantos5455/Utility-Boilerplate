"use client"
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import WalletContextProvider from "@/common/WalletContextProvider";
import AppContextProvider from "@/common/AppContextProvider"
import { ThemeProvider } from "@/components/layouts/theme-provider";

export const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    <AppContextProvider>
      <AppContextProvider>
        <WalletContextProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header></Header>
            <div className="lg:max-w-screen-lg mx-auto flex items-center justify-center">
              {children}
            </div>
            <Footer></Footer>
          </ThemeProvider>
        </WalletContextProvider>
      </AppContextProvider>
    </AppContextProvider>
  );
}