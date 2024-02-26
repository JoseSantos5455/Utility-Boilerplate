"use client"
import { AppContext } from "@/common/AppContextProvider"
import { WalletContext } from "@/common/WalletContextProvider"
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

export default function Profile () {
  const { network, showAlert, tlr } = useContext(AppContext)
  const { walletData } = useContext(WalletContext)

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

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
  }, [walletData])

  const openUpdateDialog = () => {
    setIsUpdateDialogOpen(true)
  }

  const onCloseUpdateDialog = () => {
    setIsUpdateDialogOpen(false)
  }

  const dummyData = {
    "v": "1.2",
    "name": "User or profile title or name",
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

  const updateProfile = () => {
    console.log(dummyData)
  }

  return (
    <div className="text-center justify-center">
      My profile - {walletData.primary_addr}
      <Button onClick={openUpdateDialog}>Update my Profile</Button>
      <Button onClick={updateProfile}>Update</Button>
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