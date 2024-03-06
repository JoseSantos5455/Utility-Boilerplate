import { useState, createContext, useContext, useEffect } from "react"
import { AppContext } from "./AppContextProvider"
import getPendingTransactionForAddress from "@/lib/get-pending-tx-for-address"

type WalletContextType = {
  walletData: {
    type: string,
    connected: boolean,
    primary_addr: string,
    pendingTxCount: number
  },
  setWalletData: Function
}

const WalletContextDefaultValues: WalletContextType = {
  walletData: {
    type: '',
    connected: false,
    primary_addr: '',
    pendingTxCount: 0
  },
  setWalletData: (f: any) => f
}

export const WalletContext = createContext<WalletContextType>(WalletContextDefaultValues)

export default function WalletContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { network } = useContext(AppContext)

  const [walletData, setWalletData] = useState({
    type: '',
    connected: false,
    primary_addr: '',
    pendingTxCount: 0
  })

  useEffect(() => {
    const scanTransaction = async (address: string) => {
      if (walletData.connected) {
        const res: any[] = await getPendingTransactionForAddress(walletData.primary_addr, network)
        setWalletData({
          ...walletData,
          pendingTxCount: res.length
        })
      }
    }
    scanTransaction(walletData.primary_addr)
  }, [walletData.primary_addr, walletData.connected])


  return (
    <WalletContext.Provider value={{ walletData, setWalletData }}>
      {children}
    </WalletContext.Provider>
  )
}