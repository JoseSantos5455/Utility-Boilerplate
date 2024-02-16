"use client"
import { useContext, useEffect, useState } from "react";
import axios from 'axios'
import { WalletContext } from "@/common/WalletContextProvider";
import { NetworkContext } from "@/common/NetworkContextProvider";

export default function MintSubrealm () {

  const tlr = 'dntest'
  const [searchStr, setSearchStr] = useState('')
  const { network, api_endpoint } = useContext(NetworkContext)

  const mintSubrealm = async () => {



    let str = searchStr.trim()

    if (str.startsWith('+')) 
      str = str.substring(1, str.length).trim()

    if (!str) {
      alert('input your subrealm')
      return
    }

    if (!str.startsWith(`${tlr}.`) || str.split('.').length > 2) {
      alert(`you can only mint \'${tlr}\' subrealms here...`)
      return
    }

    str = str.substring((tlr.length + 1), str.length).trim()
    if (!str) {
      alert(`input your subrealm after ${tlr}`)
      return
    }

    // const existence = await realmExists(str, api_endpoint)
    // if (existence) {
    //   alert('that sub realm already exists. try different one')
    //   return
    // }

    // const { status, msg } = await requestMintSubrealm(tlr, `${tlr}.${str}`, api_endpoint);
    // if (status === 'error') {
    //   alert(msg)
    //   return
    // }



  }

  return (
    <div>
      <div>
        <input 
          type="text" 
          value={searchStr}
          onChange={e => setSearchStr(e.target.value)}
        />
      </div>
      <div>
        <button onClick={() => mintSubrealm()}>MINT SUBREALM</button>
      </div>
    </div>
  )
}