"use client"
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import WalletContextProvider from "@/providers/WalletContextProvider";
import AppContextProvider from "@/providers/AppContextProvider"
import { ThemeProvider } from "@/providers/ThemeProvider";

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
            <div className=" max-w-[1280px] mx-auto" >
              {children}
            </div>
            <Footer></Footer>
          </ThemeProvider>
        </WalletContextProvider>
      </AppContextProvider>
    </AppContextProvider>
  );
}