"use client"
import { AppContext } from "@/providers/AppContextProvider"
import { WalletContext } from "@/providers/WalletContextProvider"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
import { ImageFromUrn } from "@/components/profile/ImageFromUrn"
import ImageFromData from "@/components/common/ImageFromData"

export default function Profile () {
  const { network, showAlert, showError, tlr } = useContext(AppContext)
  const { walletData } = useContext(WalletContext)

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [realmList, setRealmList] = useState<any>([])
  const [subrealmList, setSubrealmList] = useState<any>([])
  const [pfpNftList, setPfpNftList] = useState<any>([])
  const [currentRealm, setCurrentRealm] = useState("")

  useEffect(() => {

    const getAtomicals = async () => {
      if (walletData.connected) {
        const { atomicalNFTs }: { atomicalNFTs: any[] } = await window.wizz.getAtomicalsBalance()
        console.log(atomicalNFTs)

        let pfps: any[] = [], realms: any[] = [], subrealms: any[] = []
        atomicalNFTs.map((elem: any) => {
          const { type, subtype, confirmed, $request_dmitem_status, $request_subrealm_status, $request_realm_status} = elem
          if (type === "NFT") {
            if (subtype === "realm") {
              if ( $request_realm_status.status === "verified") realms.push(elem)
            }
            else if (subtype === "subrealm") {
              if ( $request_subrealm_status.status === "verified") subrealms.push(elem)
            }
            else if (subtype === "dmitem") {
              if ( $request_dmitem_status.status === "verified") pfps.push(elem)
            }
            else if (!subtype) {    // this is not collection, just solo nft
              pfps.push(elem)
            }
          }
        })
        setRealmList(realms)
        setSubrealmList(subrealms)
        setPfpNftList(pfps)
      }
    }

    getAtomicals()

  }, [walletData, network])

  useEffect(() => {
    console.log(currentRealm)
  }, [currentRealm])

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
      const res = await command.run(signPsbts);
    } catch (error: any) {
      console.log(error)
    } finally {
      atomicals.electrumApi.close();
    }
  }

  const signPsbts = async (toSignPsbt: any) => {
    const signedPsbt = await window.wizz.signPsbt(toSignPsbt)
    await window.wizz.pushPsbt(signedPsbt)
    console.log(signedPsbt)
  }

  if (!walletData.connected) {
    return (
      <div className="text-center justify-center">
        Connect your wallet to continue...
      </div>
    )
  }

  return (
    <div className="text-center justify-center">
      {/* My profile - {walletData.primary_addr} */}
      <div>
        {
          pfpNftList.map((elem: any) => (
            <ImageFromData data={elem} key={elem.atomical_id} />
            // <ImageFromUrn  />
          ))
        }
      </div>
      <Select onValueChange={(val: any) => setCurrentRealm(val)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          {
            realmList.map((elem: any) => (
              <SelectItem key={elem.atomical_id} value={`\"${elem.atomical_id}\"`}>{elem.$full_realm_name}</SelectItem>
            ))
          }
          {
            subrealmList.map((elem: any) => (
              <SelectItem key={elem.atomical_id} value={`\"${elem.atomical_id}\"`}>{elem.$full_realm_name}</SelectItem>
            ))
          }
        </SelectContent>
      </Select>

      <Dialog open={isUpdateDialogOpen} onOpenChange={onCloseUpdateDialog} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update your profile</DialogTitle>
            <DialogDescription>
              
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}