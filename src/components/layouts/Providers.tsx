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
            <div className=" lg:w-4/12 mx-auto lg:px-0 px-8 flex items-center justify-center">
              {children}
            </div>
            <Footer></Footer>
          </ThemeProvider>
        </WalletContextProvider>
      </AppContextProvider>
    </AppContextProvider>
  );
}