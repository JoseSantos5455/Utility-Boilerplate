import { useState, createContext, useEffect } from "react"

type NetworkContextType = {
  network: string,
  api_endpoint: string,
  setNetwork: Function,
  setAPIEndpoint: Function
}

const NetworkContextDefaultValues: NetworkContextType = {
  network: 'mainnet',
  api_endpoint: '',
  setNetwork: (f: any) => f,
  setAPIEndpoint: (f: any) => f
}

export const NetworkContext = createContext<NetworkContextType>(NetworkContextDefaultValues)

export default function NetworkContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [network, setNetwork] = useState('mainnet')
  const [api_endpoint, setAPIEndpoint] = useState(process.env.NEXT_PUBLIC_CURRENT_PROXY || '')

  useEffect(() => {
    if ( network === 'mainnet' )
      setAPIEndpoint(process.env.NEXT_PUBLIC_CURRENT_PROXY || '')
    else if ( network === 'testnet' )
      setAPIEndpoint(process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET || '')
  }, [network])

  return (
    <NetworkContext.Provider value={{ network, setNetwork, api_endpoint, setAPIEndpoint }}>
      {children}
    </NetworkContext.Provider>
  )
}