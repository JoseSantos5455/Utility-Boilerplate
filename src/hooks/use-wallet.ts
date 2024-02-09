import { useLocalStorage } from "usehooks-ts";

export const useWalletConnected = () => {

  const [walletConnected, setWalletConnected] = useLocalStorage<string>('walletConnected', () => {
    if ( typeof window === 'undefined' )
      return 'waiting'
    if ( localStorage )
      return localStorage.getItem('walletConnect') || 'waiting'
    return 'waiting'
  })

  return [walletConnected, setWalletConnected] as const
}

export const useWalletType = () => {

  const [walletType, setWalletType] = useLocalStorage<string>('walletType', () => {
    if ( typeof window === 'undefined' )
      return 'atom'
    if ( localStorage )
      localStorage.getItem('walletType') || 'atom'
    return 'atom'
  })
  
  return [walletType, setWalletType] as const
}

export const useWalletCurrentAddress = () => {

  const [walletCurrentAddress, setWalletCurrentAddress] = useLocalStorage<string>('walletCurrentAddress', () => {
    if ( typeof window === 'undefined' )
      return ''
    if ( localStorage )
      localStorage.getItem('walletConnect') || ''
    return ''
  })

  return [walletCurrentAddress, setWalletCurrentAddress] as const
}
