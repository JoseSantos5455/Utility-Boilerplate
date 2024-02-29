"use client"
import { useEffect, useState } from "react"

export const Donates = ({donates}: {donates: any}) => {

  const [donateList, setDonateList] = useState<any[]>([])

  useEffect(() => {
    if (donates) {
      let arr: any = []
      Object.keys(donates).map((chain: any) => {
        arr.push({
          chain,
          address: donates[chain]
        })
      })
      setDonateList(arr)
    }
  }, [donates])

  return (
    <div className="flex lg:flex-row flex-col gap-8">
      {
        donateList && donateList.map((elem: any) => {
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