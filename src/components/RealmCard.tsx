"use client"
import { useEffect, useContext, useState } from "react"
import { AppContext } from "@/common/AppContextProvider";
import axios from 'axios'
import { Button } from "./ui/button";
import Image from "next/image";
import { ImageFromRealmAtomicalId } from "@/app/profile/ImageFromRealmAtomicalId";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const RealmCard = ({atomicalId, subrealmName, filter}: {atomicalId?: string, subrealmName?: string, filter: string}) => {

  const { network, tlr } = useContext(AppContext)
  const [loading, setLoading] = useState(true)

  const [atomicalNumber, setAtomicalNumber] = useState("-----")
  const [status, setStatus] = useState("unknown")
  // const [subrealmName, setSubrealmName] = useState("-----")

  useEffect(() => {
    const fetchData = async () => await getDetailedInfoFromAtomicalId()
    if (!atomicalId?.startsWith("fake-skeleton")) {
      fetchData()
    }
  }, [])

  const getDetailedInfoFromAtomicalId = async () => {
    setLoading(true)
    const APIEndpoint = `https://ep.atomicals.xyz${network === "testnet" ? "/testnet" : ""}/proxy/blockchain.atomicals.get?params=[\"${atomicalId}\"]`
    const response = await axios.get(APIEndpoint)
    if (response.data && response.data.success) {
      const { atomical_id, atomical_number, $request_subrealm, $request_subrealm_status } = response.data.response.result
      setStatus($request_subrealm_status.status)
      setAtomicalNumber(atomical_number)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Skeleton className="h-[277px] w-full rounded-xl" />
    )
  }
  return (
    <Card style={{display: `${(status === "verified" && subrealmName && subrealmName.indexOf(filter) > -1) ? "block" : "none"}`}} className={`flex flex-col items-center`}>
      <CardHeader>
        <ImageFromRealmAtomicalId atomicalId={atomicalId || ""}  />
        <div className="flex flex-col items-center justify-around space-y-2">
          <CardTitle>{subrealmName}</CardTitle>
          <CardDescription>#{atomicalNumber}</CardDescription>
          <Button>
            <a href={`/profile/${tlr}.${subrealmName}`} target="_blank">See more</a>
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}