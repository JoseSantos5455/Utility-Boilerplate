"use client"
import { AppContext } from "@/common/AppContextProvider"
import { WalletContext } from "@/common/WalletContextProvider"

import axios from "axios"
import { AtomicalsPayload, prepareCommitRevealConfigWithChildXOnlyPubkey } from "../atomical-lib/commands/command-helpers"
import * as ecc from '@bitcoinerlab/secp256k1';
import { Psbt, script } from 'bitcoinjs-lib'
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
import { BASE_BYTES, FeeCalculations, INPUT_BYTES_BASE, OUTPUT_BYTES_BASE } from "../atomical-lib/utils/atomical-operation-builder"
import { Atomicals, ElectrumApi } from "../atomical-lib"
import { CommandInterface } from "../atomical-lib/commands/command.interface"
import { getKeypairInfo } from "../atomical-lib/utils/address-keypair-path"
import { SetProfileCommand } from "../atomical-lib/commands/set-profile-command"

export default function Profile () {
  const { network, showAlert, showError, tlr } = useContext(AppContext)
  const { walletData } = useContext(WalletContext)
  const APIEndpoint = network === 'testnet' ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [TLRList, setTLRList] = useState<any>([])

  const [pfpId, setPfpId] = useState("")
  const [userName, setUserName] = useState("")
  const [userDescription, setUserDescription] = useState("")
  const [ids, setIds] = useState([])
  const [wallets, setWallets] = useState([])
  const [links, setLinks] = useState([])
  const [collections, setCollections] = useState([])

  useEffect(() => {
    if (!walletData.connected) {
      showAlert("Connect your wallet to view your profile.")
    }
    const clientAddress = walletData.primary_addr

    const getProfile = async () => {
      const atomicalId = await getAtomicalIdFromRealmname("dntest1")
      const his = await getStateHistoryFromAtomicalId(atomicalId)
      console.log(his)
    }
    // getProfile()

  }, [walletData])

  const getAtomicalIdFromRealmname = async (str: string) => {
    const url = `${APIEndpoint}/blockchain.atomicals.get_realm_info?params=[\"${str}\"]`
    const response = await axios.get(url)
    if (response.data && response.data.success) {
      const { atomical_id } = response.data.response.result
      return atomical_id
    }
    return ""
  }

  const getStateHistoryFromAtomicalId = async (atomicalId: string) => {
    const url = `${APIEndpoint}/blockchain.atomicals.get_state_history?params=[\"${atomicalId}\"]`
    const response = await axios.get(url)
    if (response.data && response.data.success) {
      const { history } = response.data.response.result.state
      return history
    }
    return []
  }

  const openUpdateDialog = () => {
    setIsUpdateDialogOpen(true)
  }

  const onCloseUpdateDialog = () => {
    setIsUpdateDialogOpen(false)
  }

  const dummyData = {
    "v": "1.2",
    "name": "dntest1-001",
    "image": "atom:btc:id:<atomicalId>/image.jpg",
    "desc": "Lorem ipsum dolor sit amet...",
    "ids": {
      "0": {
        "t": "realm",
        "v": "myrealmname"
      }
    },
    "wallets": {
      "btc": {
        "address": "btc address to receive donations"
      }
    },
    "links": {
      "0": {
        "group": "social",
        "items": {
          "0": {
            "type": "x",
            "name": "@loremipsum9872",
            "url": "https://x.com/loremipsum9872"
          }
        }
      }
    }
  }


  const updateProfile_ = async () => {  

    const publicKey = await window.wizz.getPublicKey()
    
    const { atomicalsUTXOs, atomicalNFTs, regularUTXOs, scripthash }: { atomicalsUTXOs: any[], atomicalNFTs: any[], regularUTXOs: any[], scripthash: string} = await window.wizz.getAtomicalsBalance()
    console.log(atomicalNFTs)
    const atomicalId = atomicalNFTs[11]["atomical_id"]

    const atomicals = new Atomicals(ElectrumApi.createClient((network === 'testnet' ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY) || ''));
    try {
      await atomicals.electrumApi.open();
      const command: CommandInterface = new SetProfileCommand(atomicals.electrumApi, {
        satsbyte: 3,
        satsoutput: 1000
      }, atomicalId, dummyData, publicKey);
      const res = await command.run(signTheP);
    } catch (error: any) {
      console.log(error)
    } finally {
      atomicals.electrumApi.close();
    }

  }

  const signTheP = async (toSignPsbt: any) => {
    await window.wizz.pushPsbt(toSignPsbt)
    // console.log(toSignPsbt)
  }

  const updateProfile = async () => {

    let scriptP2TR: any = null;
    let hashLockP2TR: any = null;

    const { atomicalsUTXOs, atomicalNFTs, regularUTXOs, scripthash }: { atomicalsUTXOs: any[], atomicalNFTs: any[], regularUTXOs: any[], scripthash: string} = await window.wizz.getAtomicalsBalance()
    
    // if (!atomicalsUTXOs || atomicalsUTXOs.length < 1) {
    //   showAlert("No Atomicals in this wallet...")
    //   return
    // }

    // if (!atomicalNFTs || atomicalNFTs.length < 1) {
    //   showAlert("No NFTs in this wallet...")
    //   return
    // }

    let tlr_list: any[] = []
    atomicalNFTs.map((atomicalNFT: any) => {
      const { subtype } = atomicalNFT
      if (subtype === "realm") {
        // have to add here status === verified checking
        tlr_list.push(atomicalNFT)
      }
    })

    setTLRList(tlr_list)

    if (!regularUTXOs || regularUTXOs.length < 1) {
      showAlert("Insufficient BTC balance in this wallet...")
      return
    }

    const mockAtomPayload = new AtomicalsPayload(dummyData);
    console.log(mockAtomPayload)
    const userSetSatsbyte = 2;

    const publicKey = await window.wizz.getPublicKey()
    const childXOnlyPubKey = Buffer.from(publicKey, 'hex').slice(1, 33)
    const { address, output } = bitcoin.payments.p2tr({ 
      internalPubkey: childXOnlyPubKey,
      network: bitcoin.networks.testnet
    })

    const mockBaseCommitForFeeCalculation: { scriptP2TR: any; hashLockP2TR: any } =
      prepareCommitRevealConfigWithChildXOnlyPubkey(
          'mod',
          childXOnlyPubKey,
          mockAtomPayload
      );
    console.log(mockBaseCommitForFeeCalculation)

    const fees: FeeCalculations =
      calculateFeesRequiredForAccumulatedCommitAndReveal( 
        mockBaseCommitForFeeCalculation.hashLockP2TR.redeem.output.length, 
        userSetSatsbyte, // user set satsbyte
        [], // input utxos
        [] // additional outputs
      );
    console.log(fees)

    scriptP2TR = mockBaseCommitForFeeCalculation.scriptP2TR;
    hashLockP2TR = mockBaseCommitForFeeCalculation.hashLockP2TR;
    console.log(scriptP2TR)
    console.log(hashLockP2TR)

    const fundingUtxo = regularUTXOs[0]
    console.log(fundingUtxo)

    let psbtStart = new Psbt({ network: bitcoin.networks.testnet })
    psbtStart.setVersion(1);

    psbtStart.addInput({
      hash: fundingUtxo.txid,
      index: fundingUtxo.index,
      tapInternalKey: Buffer.from(childXOnlyPubKey),
      witnessUtxo: {
        value: fundingUtxo.value,
        script: Buffer.from(output, "hex")
      }
    })

    psbtStart.addOutput({
      address: scriptP2TR.address,
      value: fees.revealFeePlusOutputs
    })

    console.log(psbtStart)

    await window.wizz.pushPsbt(psbtStart)

  }

  const calculateFeesRequiredForAccumulatedCommitAndReveal = (hashLockP2TROutputLen: number = 0, satsbyte: number = 0, inputUtxos: any[], additionalOutputs: any[]) => {
    const revealFee = calculateAmountRequiredForReveal( hashLockP2TROutputLen, satsbyte, [], [] );
    const commitFee = calculateFeesRequiredForCommit(satsbyte);
    const commitAndRevealFee = commitFee + revealFee;
    const commitAndRevealFeePlusOutputs =
        commitFee + revealFee + totalOutputSum(additionalOutputs);
    const revealFeePlusOutputs = revealFee + totalOutputSum(additionalOutputs);
    const ret = {
        commitAndRevealFee,
        commitAndRevealFeePlusOutputs,
        revealFeePlusOutputs,
        commitFeeOnly: commitFee,
        revealFeeOnly: revealFee,
    };
    return ret;
  }

  const calculateAmountRequiredForReveal = (hashLockP2TROutputLen: number = 0, satsbyte: number = 200, inputUtxos: any[], additionalOutputs: any[]) => {
    const OP_RETURN_BYTES: number = 21 + 8 + 1;
    //-----------------------------------------
    const REVEAL_INPUT_BYTES_BASE = 66;
    // OP_RETURN size
    let hashLockCompactSizeBytes = 9;
    let op_Return_SizeBytes = 0;
    if (hashLockP2TROutputLen <= 252) {
        hashLockCompactSizeBytes = 1;
    } else if (hashLockP2TROutputLen <= 0xffff) {
        hashLockCompactSizeBytes = 3;
    } else if (hashLockP2TROutputLen <= 0xffffffff) {
        hashLockCompactSizeBytes = 5;
    }
    return Math.ceil(
      (satsbyte as any) *
        (BASE_BYTES +
          // Reveal input
          REVEAL_INPUT_BYTES_BASE +
          (hashLockCompactSizeBytes + hashLockP2TROutputLen) / 4 +
          // Additional inputs
          inputUtxos.length * INPUT_BYTES_BASE +
          // Outputs
          additionalOutputs.length * OUTPUT_BYTES_BASE +
          // Bitwork Output OP_RETURN Size Bytes
          op_Return_SizeBytes)
      )
  }

  const calculateFeesRequiredForCommit = (satsbyte: number): number => {
    let fees =  Math.ceil(
      (satsbyte as any) *
        (BASE_BYTES + 1 * INPUT_BYTES_BASE + 1 * OUTPUT_BYTES_BASE)
    );
    return fees;
  }

  const totalOutputSum = (additionalOutputs: any[]): number => {
    let sum = 0;
    for (const additionalOutput of additionalOutputs) {
        sum += additionalOutput.value;
    }
    return sum;
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
      <Button onClick={updateProfile}>Update</Button>
      <Button onClick={updateProfile_}>updateProfile_</Button>
      <div className="mt-10">
        {
          TLRList.map((elem: any) => (
            <Button onClick={() => setTo(elem.utxo)}>set to +{elem.$full_realm_name}</Button>
          ))
        }
      </div>
      <Dialog open={isUpdateDialogOpen} onOpenChange={onCloseUpdateDialog} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update your profile</DialogTitle>
            <DialogDescription>
              <div>
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
              }
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}