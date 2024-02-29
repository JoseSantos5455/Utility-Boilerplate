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
  }, [wallets])

  return (
    <div className="flex lg:flex-row flex-col gap-8">
      {
        walletList && walletList.map((elem: any) => {
          let coin = "btc"
          if (elem && elem.chain)
            coin = elem.chain.toString()
          let addr = "??????????"
          if (elem && elem.address && elem.address.address)
            addr = elem.address.address.toString()
          const short_addr = `${addr.substring(0, 5)}...${addr.substring(addr.length - 5, addr.length)}`
          return (
            <div key={`${coin}${addr}`} className="flex flex-row gap-2">
              <div>{coin}</div>
              <div>{short_addr}</div>
            </div>
          )
        })
      }
    </div>
  )
}