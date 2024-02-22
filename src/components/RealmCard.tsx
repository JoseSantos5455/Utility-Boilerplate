"use client"
import { useEffect, useContext, useState } from "react"
import { AppContext } from "@/common/AppContextProvider";
import axios from 'axios'
import { Button } from "./ui/button";
import Image from "next/image";

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
  // const [subrealmName, setSubrealmName] = useState("-----")

  useEffect(() => {
    console.log('I am being drawn')
    const fetchData = async () => await getDetailedInfoFromAtomicalId()
    if (!atomicalId?.startsWith("fake-skeleton")) {
      fetchData()
    }
  }, [])

  useEffect(() => {
    console.log(filter)
    console.log(subrealmName && subrealmName?.indexOf(filter) > -1)
  }, [filter])

  const getDetailedInfoFromAtomicalId = async () => {
    setLoading(true)
    const APIEndpoint = `https://ep.atomicals.xyz${network === "testnet" ? "/testnet" : ""}/proxy/blockchain.atomicals.get?params=[\"${atomicalId}\"]`
    const response = await axios.get(APIEndpoint)
    if (response.data && response.data.success) {
      const { atomical_id, atomical_number, $request_subrealm } = response.data.response.result
      // setSubrealmName($request_subrealm)
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
    // <Card className={`${(subrealmName && subrealmName?.indexOf(filter) > -1) ? "" : "hidden"} flex flex-col items-center`}>
    <Card className={`${(subrealmName && subrealmName.indexOf(filter) > -1) ? "" : "hidden"} flex flex-col items-center`}>
      <CardHeader>
        <Image className="rounded-lg" width={120} height={120} src={`/bull.jpg`} alt="" />
        <div className="flex flex-col items-center justify-around space-y-2">
          <CardTitle>{atomicalNumber}</CardTitle>
          <CardDescription>+{tlr}.{subrealmName}</CardDescription>
          <Button>
            <a href={`/visit:${atomicalId}`} target="_blank">See more</a>
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}