"use client"
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { NextUIProvider } from "@nextui-org/react";
import { createContext, useState } from "react";

export const WalletContext = createContext({})

export const LayoutWithNextUI = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  
  const [walletData, setWalletData] = useState({
    type: '',
    connected: false,
    legacy_addr: '',
    segwit_addr: '',
    taproot_addr: ''
  })

  return (
    <NextUIProvider>
      <WalletContext.Provider value={walletData}>
        <Header></Header>
          <div>
            {children}
          </div>
        <Footer></Footer>
      </WalletContext.Provider>
    </NextUIProvider>
  );
}