"use client"
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { NextUIProvider } from "@nextui-org/react";
import WalletContextProvider from "@/common/WalletContextProvider";

export const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    <NextUIProvider>
      <WalletContextProvider>
        <Header></Header>
          <div>
            {children}
          </div>
        <Footer></Footer>
      </WalletContextProvider>
    </NextUIProvider>
  );
}