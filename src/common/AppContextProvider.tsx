import { useState, createContext } from "react"

type AppContextType = {
  network: string,
  setNetwork: Function,
  tlr: string,
  mnemonic: string,
  setMnemonic: Function,
  WIF: string,
  setWIF: Function,
  subrealmCurrentState: string,
  toNotify: string,
  setSubrealmCurrentState: Function,
  setToNotify: Function,
}

const AppContextDefaultValues: AppContextType = {
  network: '',
  setNetwork: (f: any) => f,
  tlr: '',
  mnemonic: '',
  setMnemonic: (f: any) => f,
  WIF: '',
  setWIF: (f: any) => f,
  subrealmCurrentState: '',
  toNotify: '',
  setSubrealmCurrentState: (f: any) => f,
  setToNotify: (f: any) => f,
}

export const AppContext = createContext<AppContextType>(AppContextDefaultValues)

export default function AppContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [network, setNetwork] = useState('bitcoin')
  const [tlr, ] = useState(process.env.NEXT_PUBLIC_TOP_LEVEL_REALM || 'bullrun')
  const [mnemonic, setMnemonic] = useState('')
  const [WIF, setWIF] = useState('')
  const [subrealmCurrentState, setSubrealmCurrentState] = useState('ready')
  const [toNotify, setToNotify] = useState('')

  return (
    <AppContext.Provider value={{ network, setNetwork, tlr, mnemonic, setMnemonic, WIF, setWIF, subrealmCurrentState, toNotify, setSubrealmCurrentState, setToNotify }}>
      {children}
    </AppContext.Provider>
  )
}