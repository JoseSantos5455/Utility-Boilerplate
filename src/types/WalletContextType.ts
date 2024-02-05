export type WalletContextType = {
  walletData: {
    type: string,
    connected: boolean,
    legacy_addr: string,
    segwit_addr: string,
    taproot_addr: string
  },
  setWalletData: Function
}