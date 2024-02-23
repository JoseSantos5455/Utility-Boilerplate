"use client"
import { useEffect, useState } from "react"

export const Wallets = ({wallets}: {wallets: any}) => {

  const [walletList, setWalletList] = useState<any[]>([])

  useEffect(() => {
    if (wallets) {
      let arr: any = []
      // console.log(Object.keys(wallets))
      Object.keys(wallets).map((chain: any) => {
        arr.push({
          chain,
          address: wallets[chain]
        })
      })
      setWalletList(arr)
      console.log(walletList)
    }
  }, [])

  useEffect(() => {
    console.log(walletList)
  }, [walletList])

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