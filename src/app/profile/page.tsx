"use client"
import { AppContext } from "@/providers/AppContextProvider"
import { WalletContext } from "@/providers/WalletContextProvider"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useContext, useEffect, useState } from "react"
import { Atomicals, ElectrumApi, createKeyPair } from "../atomical-lib"
import { CommandInterface } from "../atomical-lib/commands/command.interface"
import { getKeypairInfo } from "../atomical-lib/utils/address-keypair-path"
import { SetProfileCommand } from "../atomical-lib/commands/set-profile-command"
import getStateHistoryFromAtomicalId from "@/lib/get-state-history-from-atomical-id";
import getAtomicalIdFromRealmname from "@/lib/get-atomical-id-from-realmname";
import { ImageFromUrn } from "@/components/profile/ImageFromUrn"
import ImageFromData from "@/components/common/ImageFromData"
import SelectPFP from "@/components/profile/SelectPFP"
import ImageFromDataClickable from "@/components/common/ImageFromDataClickable"
import NameEdit from "@/components/profile/NameEdit"
import DescriptionEdit from "@/components/profile/DescriptionEdit"
import LinksEdit from "@/components/profile/LinksEdit"
import DonatesEdit from "@/components/profile/DonatesEdit"
import ClickToChoosePFP from "@/components/profile/ClickToChoosePFP"
import isProfileNft from "@/lib/is-profile-nft"
import isPfpNft from "@/lib/is-pfp-nft"

export default function Profile () {
  const { network, showAlert, showError, tlr, mnemonic } = useContext(AppContext)
  const { walletData } = useContext(WalletContext)

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [realmList, setRealmList] = useState<any>([])
  const [subrealmList, setSubrealmList] = useState<any>([])
  const [pfpNftList, setPfpNftList] = useState<any>([])
  const [profileNftList, setProfileNftList] = useState<any>([])
  const [currentRealm, setCurrentRealm] = useState<any>(null)

  const [selectedPFPId, setSelectedPFPId] = useState<string>("")
  const [selectedPFPData, setSelectedPFPData] = useState<any>()
  const [isPFPSheetOpen, setIsPFPSheetOpen] = useState(false)
  const [profileName, setProfileName] = useState("Click to edit your name")
  const [profileDescription, setProfileDescription] = useState("Click to write your bio or description.")
  const [links, setLinks] = useState<any>([])
  const [donates, setDonates] = useState<any>([])

  useEffect(() => {

    const getAtomicals = async () => {
      if (walletData.connected) {
        const { atomicalNFTs }: { atomicalNFTs: any[] } = await window.wizz.getAtomicalsBalance()
        console.log(atomicalNFTs)

        let pfps: any[] = [], realms: any[] = [], subrealms: any[] = [], profiles: any[] = []
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
              if (confirmed || confirmed === "true") {
                if (isProfileNft(elem))
                  profiles.push(elem)
                if (isPfpNft(elem))
                  pfps.push(elem)
              }
            }
          }
        })
        setRealmList(realms)
        if (realms.length > 0)
          setCurrentRealm(realms[0])
        setSubrealmList(subrealms)
        setPfpNftList(pfps)
        setProfileNftList(profiles)
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
    // "d": "2435aa7c81bacaf06d7ce74f8e44406730a318a1419cce98530ea0eae15a3c93i0"
    "d": "834294414ea77ec09b989f95ced4e45864cd3667b1c25bb282ced02ba00845e6i0"
  }

  const mintDelegate = async () => {

  }

  const testInscribe = async () => {  
    const publicKey = await window.wizz.getPublicKey()    

    if (!currentRealm) {
      showAlert("Please choose your subrealm and continue.")
      return;
    }
    let { atomical_id: atomicalId } = currentRealm
    atomicalId = atomicalId.replaceAll("\"", "")

    const funding_address = await createKeyPair(mnemonic, "m/86'/0'/0'/1/0")
    const { WIF } = funding_address

    const atomicals = new Atomicals(ElectrumApi.createClient((network === 'testnet' ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY) || ''));
    try {
      await atomicals.electrumApi.open();
      const command: CommandInterface = new SetProfileCommand(atomicals.electrumApi, { satsbyte: 10 }, atomicalId, dummyData, WIF, publicKey);
      const res = await command.run(signPsbts);
    } catch (error: any) {
      console.log(error)
    } finally {
      atomicals.electrumApi.close();
    }
  }

  const signPsbts = async (toSignPsbts: any[]) => {
    for (let i = 0; i < toSignPsbts.length; i++) {
      const psbt = toSignPsbts[i];
      const signedPsbt = await window.wizz.signPsbt(psbt)
      console.log(signedPsbt)
      await window.wizz.pushPsbt(signedPsbt)
      return signedPsbt
    }
  }

  if (!walletData.connected) {
    return (
      <div className="my-8 text-center justify-center">
        Connect your wallet to continue...
      </div>
    )
  }

  const getHistory = async () => {
    let { atomical_id }: { atomical_id: string} = currentRealm
    atomical_id = atomical_id.replaceAll("\"", "")
    const res = await getStateHistoryFromAtomicalId(atomical_id, network)
    console.log(res)
  }

  return (
    <div className="text-center justify-center lg:w-6/12 lg:mx-auto mx-8">
      <div className="my-4 flex flex-col items-center justify-center gap-4">
        <div>Your On-Chain Profile</div>
        {
          profileNftList.map((profileNft: any) => (
            <div>
              1<span>{profileNft.id}</span>
            </div>
          ))
        }
        <Select value={!currentRealm ? "" : currentRealm.atomical_id} onValueChange={(val: any) => setCurrentRealm({atomical_id: val.toString()})}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select your realm" />
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
      </div>

      <ClickToChoosePFP atomicalId={selectedPFPId} data={selectedPFPData} onClick={() => setIsPFPSheetOpen(true)} />
      <Sheet open={isPFPSheetOpen} onOpenChange={() => setIsPFPSheetOpen(false)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Choose one of your NFT as your avatar.</SheetTitle>
            <SheetDescription>
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="flex flex-col gap-4">
                  {
                    pfpNftList.map((elem: any) => (
                      <ImageFromDataClickable 
                        onClick={(data: any) => { 
                          setSelectedPFPId(elem.atomical_id)
                          setSelectedPFPData(data)
                          setIsPFPSheetOpen(false)
                        }} 
                        data={elem} 
                        key={elem.atomical_id} 
                      />
                    ))
                  }
                </div>
              </ScrollArea>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <div className="flex flex-col gap-4 mt-6">
        <NameEdit value={profileName} onEdit={(data: any) => setProfileName(data || "Click to edit your name")} />
        <DescriptionEdit value={profileDescription} onEdit={(data: any) => setProfileDescription(data || "Click to write your bio or description.")} />
        <LinksEdit value={links} onEdit={(data: any) => setLinks(data)} />
        <DonatesEdit value={donates} onEdit={(data: any) => setDonates(data)} />
        <Button className="lg:w-1/2 w-full lg:mx-auto" onClick={() => {
          mintDelegate()
        }}>Mint Profile</Button>
        <Button className="lg:w-1/2 w-full lg:mx-auto" onClick={() => {
          testInscribe()
        }}>Publish On-Chain</Button>
        <Button className="lg:w-1/2 w-full lg:mx-auto" onClick={() => {
          getHistory()
        }}>Get History</Button>
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={onCloseUpdateDialog} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update your profile</DialogTitle>
            <DialogDescription>
              This might take a few minutes. Please do not close this tab.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}