import { useState, createContext } from "react"

type AppContextType = {
  network: string,
  setNetwork: Function,
  tlr: string,
  seed: string
}

const AppContextDefaultValues: AppContextType = {
  network: '',
  setNetwork: (f: any) => f,
  tlr: '',
  seed: ''
}

export const AppContext = createContext<AppContextType>(AppContextDefaultValues)

export default function NetworkContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [network, setNetwork] = useState('testnet')
  const [tlr, ] = useState('bullrun')
  const [seed, ] = useState('')

  return (
    <AppContext.Provider value={{ network, setNetwork, tlr, seed}}>
      {children}
    </AppContext.Provider>
  )
}