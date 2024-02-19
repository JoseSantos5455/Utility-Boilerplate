"use client"
import { useContext, useEffect, useState } from "react";
import { WalletContext } from "@/common/WalletContextProvider";
import { AppContext } from "@/common/AppContextProvider";

import { createKeyPair } from "../atomical-lib/utils/create-key-pair";
import { Atomicals } from "../atomical-lib";
import { ElectrumApi } from "../atomical-lib/api/electrum-api";
import { CommandInterface } from "../atomical-lib/commands/command.interface";
import { MintInteractiveSubrealmCommand } from "../atomical-lib/commands/mint-interactive-subrealm-command";

const bip39 = require('bip39')
import BIP32Factory from "bip32";
import * as ecc from '@bitcoinerlab/secp256k1';
import { QrCode } from "lucide-react";
const bip32 = BIP32Factory(ecc);

export default function MintSubrealm () {

  const [fullname, setFullname] = useState('bullrun.')
  const { walletData } = useContext(WalletContext)
  const [receiverAddr, setReceiverAddr] = useState("")
  const { network, tlr, mnemonic, toNotify, setToNotify, subrealmCurrentState, setSubrealmCurrentState, qrCode } = useContext(AppContext)

  useEffect(() => {
    setReceiverAddr(walletData.primary_addr)
  }, [walletData.primary_addr])

  const pushInfo = (info: any) => {
    if (info.state)
      setSubrealmCurrentState(info.state)
    if (info.warning)
      setToNotify(info.warning)
  }

  const mintSubrealm = async () => {
    let str = fullname.trim()
    setSubrealmCurrentState('started')

    if (str.startsWith('+')) 
      str = str.substring(1, str.length).trim()

    if (!str) {
      setToNotify('input your subrealm')
      setSubrealmCurrentState('error')
      return
    }

    if (!str.startsWith(`${tlr}.`) || str.split('.').length > 2) {
      setToNotify(`you can only mint \'${tlr}\' subrealms here...`)
      setSubrealmCurrentState('error')
      return
    }

    let just_str = str.substring((tlr.length + 1), str.length).trim()
    if (!just_str) {
      setToNotify(`input your subrealm after ${tlr}`)
      setSubrealmCurrentState('error')
      return
    }

    const atomicals = new Atomicals(ElectrumApi.createClient((network === 'testnet' ? process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_TESTNET_BASE_URL : process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_BASE_URL) || ''));
    setSubrealmCurrentState('initilized Electrum')
    try {
      // const primary_address = await createKeyPair(mnemonic, "m/86'/0'/0'/0/0")
      const funding_address = await createKeyPair(mnemonic, "m/86'/0'/0'/1/0")
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const rootKey = bip32.fromSeed(seed);
      const childNode = rootKey.derivePath("m/86'/0'/0'/1/0");    // funding address
      const owner = {
        address: funding_address.address,
        WIF: funding_address.WIF,
        childNode
      }
      const WIF = funding_address.WIF

      setSubrealmCurrentState('prepared funding address')
      await atomicals.electrumApi.open();
      const command: CommandInterface = new MintInteractiveSubrealmCommand(atomicals.electrumApi, {
        satsbyte: -1,
        satsoutput: 1000
      }, str, receiverAddr, WIF, owner);
      const res = await command.run(pushInfo);
      // if (!res.success) {
      //   setToNotify(res.message)
      //   setSubrealmCurrentState('error')
      // }
    } catch (error: any) {
      // setToNotify(error.toString())
      // setSubrealmCurrentState('error')
    } finally {
      atomicals.electrumApi.close();
    }
  }

  return (
    <div>
      <div>
        <input 
          type="text" 
          value={fullname}
          onChange={e => setFullname(e.target.value)}
        />
      </div>
      <div>
        <button disabled={subrealmCurrentState !== "ready" && subrealmCurrentState !== "error"} onClick={() => mintSubrealm()}>MINT SUBREALM</button>
      </div>

      <div className="mt-12">
        <div>
          Receiver address
        </div>
        <div className="mt-2">
          <input 
            type="text" 
            value={receiverAddr}
            onChange={e => setReceiverAddr(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-12">
        <div>
          Current State
        </div>
        <div className="mt-2">
          {subrealmCurrentState}
        </div>
      </div>

      <div className="mt-12">
        <div>
          notification
        </div>
        <div className="mt-2">
          {toNotify}
        </div>
      </div>

      <div className="mt-12">
        <div>
          QR Code
        </div>
        <div className="mt-2">
          {qrCode}
        </div>
      </div>

    </div>
  )
}