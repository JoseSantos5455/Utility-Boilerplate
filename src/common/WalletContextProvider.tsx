import { useState, createContext } from "react"

type WalletContextType = {
  walletData: {
    type: string,
    connected: boolean,
    primary_addr: string
  },
  setWalletData: Function
}

const WalletContextDefaultValues: WalletContextType = {
  walletData: {
    type: '',
    connected: false,
    primary_addr: ''
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
    primary_addr: ''
  })

  return (
    <WalletContext.Provider value={{ walletData, setWalletData }}>
      {children}
    </WalletContext.Provider>
  )
}