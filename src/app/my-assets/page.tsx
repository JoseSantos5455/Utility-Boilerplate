"use client"
import { useContext, useEffect, useState } from "react";
// import { useWalletConnected } from "@/hooks/use-wallet";
import axios from 'axios'

export default function MyAssets () {

  // const [walletConnected, setWalletConnected] = useWalletConnected()

  const [subrealms, setSubrealms] = useState([])
  const [currentAddr, setCurrentAddr] = useState('')
  const realmName = 'bullrun.1'

  useEffect(() => {
    const addr: string = localStorage.getItem('walletCurrentAddress') || ''
    setCurrentAddr(addr)
  }, [])

  useEffect(() => {
    const fetchSubrealms = async () => {
      // const response = await axios.get(`https://ep.atomicals.xyz/proxy/blockchain.atomicals.get_realm_info?params=[\"${realmName}\",1]`)
      const response = await axios.get(`https://ep.atomicals.xyz/proxy/blockchain.atomicals.get_realm_info?params=[\"${realmName}\",1]`)
      if (response.data && response.data.success) {
        const { result } = response.data.response
        console.log(result)
        const { atomical_id, found_full_realm_name } = result
      }
    }
    fetchSubrealms()
  }, [currentAddr])

  // console.log(localStorage.getItem('walletConnected'))
  return (
    <div className="flex flex-col text-center">
      {

      }
    </div>
  )
}