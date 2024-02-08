// import { useLocalStorage } from "usehooks-ts";

// export function useWalletConnected() {

//   const [walletConnected, setWalletConnected] = useLocalStorage<string>('walletConnected', () => {
//     if ( localStorage )
//       return localStorage.getItem('walletConnect') || 'waiting'
//     return 'waiting'
//   })

//   return [walletConnected, setWalletConnected] as const
// }

// export const useWalletType = () => {

//   const [walletType, setWalletType] = useLocalStorage<string>('walletType', () => {
//     if ( localStorage )
//       localStorage.getItem('walletType') || 'atom'
//     return 'atom'
//   })
  
//   return [walletType, setWalletType] as const
// }

// export const useWalletCurrentAddress = () => {

//   const [walletCurrentAddress, setWalletCurrentAddress] = useLocalStorage<string>('walletCurrentAddress', () => {
//     if ( localStorage )
//       localStorage.getItem('walletConnect') || ''
//     return ''
//   })

//   return [walletCurrentAddress, setWalletCurrentAddress] as const
// }