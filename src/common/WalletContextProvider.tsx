import { useState, createContext } from "react"
import { WalletContextType } from "@/types/WalletContextType";

const WalletContextDefaultValues: WalletContextType = {
  walletData: {
    type: '',
    connected: false,
    legacy_addr: '',
    segwit_addr: '',
    taproot_addr: ''
  },
  setWalletData: (f: any) => f
}

export const WalletContext = createContext<WalletContextType>(WalletContextDefaultValues)

export default function WalletContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [walletData, setWalletData] = useState({
    type: '',
    connected: false,
    legacy_addr: '',
    segwit_addr: '',
    taproot_addr: ''
  })

  return (
    <WalletContext.Provider value={{ walletData, setWalletData }}>
      {children}
    </WalletContext.Provider>
  )
}