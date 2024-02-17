"use client"
import { useContext, useEffect, useState } from "react";
import { WalletContext } from "@/common/WalletContextProvider";
import { AppContext } from "@/common/AppContextProvider";

import { createKeyPair } from "../atomical-lib/utils/create-key-pair";

export default function MintSubrealm () {

  const [searchStr, setSearchStr] = useState('')
  const { walletData } = useContext(WalletContext)
  const { network, tlr, seed } = useContext(AppContext)

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

  const testPrikey = () => {
    createKeyPair()
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
      <div>
        {`tlr is ${tlr}`}
      </div>
      <div>
        {`net is ${network}`}
      </div>
      <div>
        {`addr is ${walletData.primary_addr}`}
      </div>
      <div>
        {`seed is ${seed}`}
      </div>
      <div>
        {`funding addr is ${seed}`}
      </div>
      <div>
        <button onClick={() => testPrikey()}>Test Prikey</button>
      </div>
    </div>
  )
}