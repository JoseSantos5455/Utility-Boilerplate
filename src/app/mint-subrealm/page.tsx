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
const bip32 = BIP32Factory(ecc);

export default function MintSubrealm () {

  const [searchStr, setSearchStr] = useState('')
  const { walletData } = useContext(WalletContext)
  const { network, tlr, mnemonic } = useContext(AppContext)

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

    let just_str = str.substring((tlr.length + 1), str.length).trim()
    if (!just_str) {
      alert(`input your subrealm after ${tlr}`)
      return
    }

    const atomicals = new Atomicals(ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
    try {

    const funding_address = await createKeyPair("short also cash wet ice human text economy program grocery actress bird", "m/86'/0'/0'/1/0")
    const seed = await bip39.mnemonicToSeed("short also cash wet ice human text economy program grocery actress bird");
      const rootKey = bip32.fromSeed(seed);
      const childNode = rootKey.derivePath("m/86'/0'/0'/1/0");    // funding address
      const owner = {
        address: funding_address.address,
        WIF: funding_address.WIF,
        childNode
      }
      const WIF = funding_address.WIF

      await atomicals.electrumApi.open();
      const command: CommandInterface = new MintInteractiveSubrealmCommand(atomicals.electrumApi, {
        satsbyte: 200,
        satsoutput: 1000
      }, str, walletData.primary_addr, WIF, owner);
      return await command.run();
    } catch (error: any) {
      return {
        success: false,
        message: error.toString(),
        error
      }
    } finally {
      atomicals.electrumApi.close();
    }
  }

  const testPrikey = async () => {
    // const primary_address = await createKeyPair("short also cash wet ice human text economy program grocery actress bird", "m/86'/0'/0'/0/0")
    // const funding_address = await createKeyPair("short also cash wet ice human text economy program grocery actress bird", "m/86'/0'/0'/1/0")

    // const seed = await bip39.mnemonicToSeed("short also cash wet ice human text economy program grocery actress bird");
    // const rootKey = bip32.fromSeed(seed);
    // const childNode = rootKey.derivePath("m/86'/0'/0'/1/0");    // funding address
    // console.log(JSON.stringify(childNode))
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
        {`mnemonic is ${mnemonic}`}
      </div>
      <div>
        {`funding addr is ${mnemonic}`}
      </div>
      <div>
        <button onClick={() => testPrikey()}>Test Prikey</button>
      </div>
    </div>
  )
}