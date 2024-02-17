import { useState, createContext } from "react"

type AppContextType = {
  network: string,
  setNetwork: Function,
  tlr: string,
  mnemonic: string,
  setMnemonic: Function,
  WIF: string,
  setWIF: Function
}

const AppContextDefaultValues: AppContextType = {
  network: '',
  setNetwork: (f: any) => f,
  tlr: '',
  mnemonic: '',
  setMnemonic: (f: any) => f,
  WIF: '',
  setWIF: (f: any) => f
}

export const AppContext = createContext<AppContextType>(AppContextDefaultValues)

export default function AppContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [network, setNetwork] = useState('testnet')
  const [tlr, ] = useState('bullrun')
  const [mnemonic, setMnemonic] = useState('')
  const [WIF, setWIF] = useState('')

  return (
    <AppContext.Provider value={{ network, setNetwork, tlr, mnemonic, setMnemonic, WIF, setWIF }}>
      {children}
    </AppContext.Provider>
  )
}