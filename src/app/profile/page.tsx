"use client"
import { AppContext } from "@/providers/AppContextProvider"
import { WalletContext } from "@/providers/WalletContextProvider"

import axios from "axios"
import * as ecc from '@bitcoinerlab/secp256k1';
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);

const tinysecp: TinySecp256k1Interface = ecc;
import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from "ecpair"
const ECPair: ECPairAPI = ECPairFactory(tinysecp);
// import * as bitcoin from 'bitcoinjs-lib'
// const ECPair: ECPairAPI = ECPairFactory(tinysecp);
// { Psbt, payments, networks } = bitcoin

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useContext, useEffect, useState } from "react"
import { Atomicals, ElectrumApi } from "../atomical-lib"
import { CommandInterface } from "../atomical-lib/commands/command.interface"
import { getKeypairInfo } from "../atomical-lib/utils/address-keypair-path"
import { SetProfileCommand } from "../atomical-lib/commands/set-profile-command"
import getStateHistoryFromAtomicalId from "@/lib/get-state-history-from-atomical-id";
import getAtomicalIdFromRealmname from "@/lib/get-atomical-id-from-realmname";

export default function Profile () {
  const { network, showAlert, showError, tlr } = useContext(AppContext)
  const { walletData } = useContext(WalletContext)

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [realmList, setRealmList] = useState<any>([])
  const [pfpNftList, setPfpNftList] = useState<any>([])

  // const [pfpId, setPfpId] = useState("")
  // const [userName, setUserName] = useState("")
  // const [userDescription, setUserDescription] = useState("")
  // const [ids, setIds] = useState([])
  // const [wallets, setWallets] = useState([])
  // const [links, setLinks] = useState([])
  // const [collections, setCollections] = useState([])

  useEffect(() => {
    if (!walletData.connected) {
      showAlert("Connect your wallet to view your profile.")
    }
    const clientAddress = walletData.primary_addr

    const getProfile = async () => {
      const atomicalId = await getAtomicalIdFromRealmname("dntest1", network)
      const his = await getStateHistoryFromAtomicalId(atomicalId, network)
      console.log(his)
    }
  }, [walletData])

  const openUpdateDialog = () => {
    setIsUpdateDialogOpen(true)
  }

  const onCloseUpdateDialog = () => {
    setIsUpdateDialogOpen(false)
  }

  const dummyData = {
    "d": "2435aa7c81bacaf06d7ce74f8e44406730a318a1419cce98530ea0eae15a3c93i0"
  }

  const updateProfile_ = async () => {  
    const publicKey = await window.wizz.getPublicKey()
    
    const { atomicalsUTXOs, atomicalNFTs, regularUTXOs, scripthash }: { atomicalsUTXOs: any[], atomicalNFTs: any[], regularUTXOs: any[], scripthash: string} = await window.wizz.getAtomicalsBalance()
    console.log(atomicalNFTs)
    const atomicalId = atomicalNFTs[11]["atomical_id"]

    const atomicals = new Atomicals(ElectrumApi.createClient((network === 'testnet' ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY) || ''));
    try {
      await atomicals.electrumApi.open();
      const command: CommandInterface = new SetProfileCommand(atomicals.electrumApi, { satsbyte: 10 }, atomicalId, dummyData, publicKey);
      const res = await command.run(signTheP);
    } catch (error: any) {
      console.log(error)
    } finally {
      atomicals.electrumApi.close();
    }
  }

  const signTheP = async (toSignPsbt: any) => {
    const signedPsbt = await window.wizz.signPsbt(toSignPsbt)
    await window.wizz.pushPsbt(signedPsbt)
    console.log(signedPsbt)
  }

  const setTo = (tlrUTXO: any) => {
    if (!tlrUTXO) {
      showError("Unknown error occured...")
      return
    }
    console.log(tlrUTXO)


  }

  const test = async () => {
    const publicKey = await window.wizz.getPublicKey()
    const childXOnlyPublicKey = Buffer.from(publicKey, 'hex').slice(1, 33)
    console.log(childXOnlyPublicKey)

    const testPairRaw = ECPair.fromPublicKey(publicKey)
    const fundingKeypair = getKeypairInfo(testPairRaw);
    console.log(fundingKeypair)
  }

  return (
    <div className="text-center justify-center">
      My profile - {walletData.primary_addr}
      <Button onClick={openUpdateDialog}>Update my Profile</Button>
      <Button onClick={test}>Test</Button>
      {/* <Button onClick={updateProfile}>Update</Button> */}
      <Button onClick={updateProfile_}>updateProfile_</Button>
      {/* <div className="mt-10">
        {
          TLRList.map((elem: any) => (
            <Button onClick={() => setTo(elem.utxo)}>set to +{elem.$full_realm_name}</Button>
          ))
        }
      </div> */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={onCloseUpdateDialog} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update your profile</DialogTitle>
            <DialogDescription>
              {/* <div>
                <Input value={pfpId}></Input>
              </div>
              <div>
                <Input value={userName}></Input>
              </div>
              <div>
                <Input value={userDescription}></Input>
              </div>
              {
                ids.map((id: any) => (
                  <div>
                    {id.t}: {id.v}
                  </div>
                ))
              }
              {
                wallets.map((wallet: any) => (
                  <div>
                    {wallet.type}: {wallet.address}
                  </div>
                ))
              }
              {
                links.map((group: any) => (
                  <div>
                    {
                      group.items.map((item: any) => (
                        <div>
                          {item.type}: {item.name}: {item.url}
                        </div>
                      ))
                    }
                  </div>
                ))
              }
              {
                collections.map((container: any) => (
                  <div>
                    <div>
                      {container.name}
                    </div>
                    <div>
                      {container.image}
                    </div>
                    <div>
                      {container.desc}
                    </div>
                    <div>
                      {container.meta}
                    </div>
                  </div>
                ))
              } */}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}