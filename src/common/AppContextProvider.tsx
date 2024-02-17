import { useState, createContext } from "react"

type AppContextType = {
  network: string,
  setNetwork: Function,
  tlr: string,
  seed: string,
  setSeed: Function
}

const AppContextDefaultValues: AppContextType = {
  network: '',
  setNetwork: (f: any) => f,
  tlr: '',
  seed: '',
  setSeed: (f: any) => f
}

export const AppContext = createContext<AppContextType>(AppContextDefaultValues)

export default function AppContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [network, setNetwork] = useState('testnet')
  const [tlr, ] = useState('bullrun')
  const [seed, setSeed] = useState('')

  return (
    <AppContext.Provider value={{ network, setNetwork, tlr, seed, setSeed}}>
      {children}
    </AppContext.Provider>
  )
}