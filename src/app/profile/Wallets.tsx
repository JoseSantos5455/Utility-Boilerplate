"use client"
import { useEffect, useState } from "react"

export const Wallets = ({wallets}: {wallets: any}) => {

  const [walletList, setWalletList] = useState<any[]>([])

  useEffect(() => {
    if (wallets) {
      let arr: any = []
      Object.keys(wallets).map((chain: any) => {
        arr.push({
          chain,
          address: wallets[chain]
        })
      })
      setWalletList(arr)
    }
  }, [])

  return (
    <div>
      {
        walletList && walletList.map((elem: any) => (
          <div key={elem.chain.toString()}>
            <div>{elem.chain.toString()}</div>
            <div>{elem.address.address.toString()}</div>
          </div>
        ))
      }
    </div>
  )
}