import { useState, createContext } from "react"

type WalletContextType = {
  walletData: {
    type: string,
    connected: boolean,
    legacy_taproot_addr: string,
    legacy_addr: string,
    segwit_addr: string,
    taproot_addr: string
  },
  setWalletData: Function
}

const WalletContextDefaultValues: WalletContextType = {
  walletData: {
    type: '',
    connected: false,
    legacy_taproot_addr: '',
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
    legacy_taproot_addr: '',
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