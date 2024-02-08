import { useLocalStorage } from "usehooks-ts";

export function useWalletConnected() {

  const [walletConnected, setWalletConnected] = useLocalStorage<string>('walletConnected', () => localStorage.getItem('walletConnect') || 'waiting')

  return [walletConnected, setWalletConnected] as const
}

export const useWalletType = () => {

  const [walletType, setWalletType] = useLocalStorage<string>('walletType', () => localStorage.getItem('walletType') || 'atom')
  
  return [walletType, setWalletType] as const
}

export const useWalletCurrentAddress = () => {

  const [walletCurrentAddress, setWalletCurrentAddress] = useLocalStorage<string>('walletCurrentAddress', () => localStorage.getItem('walletConnect') || '')

  return [walletCurrentAddress, setWalletCurrentAddress] as const
}