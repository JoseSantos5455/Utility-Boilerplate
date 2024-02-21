import { useState, createContext } from "react"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type AppContextType = {
  network: string,
  setNetwork: Function,
  tlr: string,
  mnemonic: string,
  setMnemonic: Function,
  WIF: string,
  setWIF: Function,
  showError: Function,
  showAlert: Function
}

const AppContextDefaultValues: AppContextType = {
  network: '',
  setNetwork: (f: any) => f,
  tlr: '',
  mnemonic: '',
  setMnemonic: (f: any) => f,
  WIF: '',
  setWIF: (f: any) => f,
  showError: (f: any) => f,
  showAlert: (f: any) => f,
}

export const AppContext = createContext<AppContextType>(AppContextDefaultValues)

export default function AppContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [network, setNetwork] = useState('bitcoin')
  // const [tlr, ] = useState(process.env.NEXT_PUBLIC_TOP_LEVEL_REALM || 'bullrun')
  const [tlr, ] = useState('ibet')
  const [mnemonic, setMnemonic] = useState('')
  const [WIF, setWIF] = useState('')

  const showError = (error_str: string) => {
    toast({
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[320px] md:top-4 md:right-4'
      ),
      variant: 'destructive',
      title: 'Oops! Something went wrong...',
      description: `${error_str}`
    })
  }

  const showAlert = (error_str: string) => {
    toast({
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[320px] md:top-4 md:right-4'
      ),
      variant: 'default',
      title: 'Info',
      description: `${error_str}`
    })
  }

  return (
    <AppContext.Provider value={{ network, setNetwork, tlr, mnemonic, setMnemonic, WIF, setWIF, showError, showAlert }}>
      {children}
      <Toaster />
    </AppContext.Provider>
  )
}