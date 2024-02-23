"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/common/AppContextProvider";

import { SubrealmPFP } from "../SubrealmPFP";
import { Wallets } from "../Wallets";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

const NOT_FOUND = "not-found"
const LOADING = "loading"
const FOUND = "found"

const Profile = ({ params }: { params: { subrealmname: string } }) => {

  const [profileName, setProfileName] = useState("")
  const [description, setDescription] = useState("")
  const [imageSrc, setImageSrc] = useState("")
  const [linksObject, setLinksObject] = useState({})
  const [walletsObject, setWalletsObject] = useState({})
  const [collectionsObject, setCollectionsObject] = useState({})

  const { subrealmname } = params
  const [status, setStatus] = useState(LOADING)
  const { network, tlr, showError, showAlert } = useContext(AppContext)
  const APIEndpoint = network === 'testnet' ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY

  const getAtomicalIdFromRealmname = async (str: string) => {
    const url = `${APIEndpoint}/blockchain.atomicals.get_realm_info?params=[\"${str}\"]`
    const response = await axios.get(url)
    if (response.data && response.data.success) {
      const { atomical_id } = response.data.response.result
      return atomical_id
    }
    return ""
  }

  const getDelegateIdFromAtomicalId = async (atomical_id: string) => {
    const url = `${APIEndpoint}/blockchain.atomicals.get_state?params=[\"${atomical_id}\"]`
    const response = await axios.get(url)
    if (response.data && response.data.success) {
      const { $request_subrealm_status, state, type, atomical_number, atomical_ref, confirmed } = response.data.response.result
      const verified = $request_subrealm_status.status
      const delegateId = state.latest.d
      return {
        verified,
        delegateId
      }
    }
    return {
      verified: false,
      delegateId: ""
    }
  }

  const getProfileDataFromDelegateId = async (delegateId: string) => {
    const url = `${APIEndpoint}/blockchain.atomicals.get?params=[\"${delegateId}\"]`
    const response = await axios.get(url)
    if (response.data && response.data.success) {
      const { mint_data } = response.data.response.result
      const { name, desc, image, links, wallets, collections } = mint_data.fields
      setProfileName(name)
      setDescription(desc)
      if (image.startsWith("atom:btc")) {
        const splits = image.split(":")
        setImageSrc(splits[splits.length - 1])
      }
      setLinksObject(links)
      setWalletsObject(wallets)
      setCollectionsObject(collections)
      setStatus(FOUND)
    }
    else
      setStatus(NOT_FOUND)
  }

  useEffect(() => {
    const fetchData = async () => {
      const atomicalId = await getAtomicalIdFromRealmname(`${tlr}.${subrealmname}`)
      if (atomicalId === "") {
        setStatus(NOT_FOUND)
      }
      else {
        const { delegateId } = await getDelegateIdFromAtomicalId(atomicalId)
        await getProfileDataFromDelegateId(delegateId)
      }
    }
    fetchData()
  }, [])

  if (status === LOADING) {
    return (
      <Skeleton className="h-[277px] w-full rounded-xl" />
    )
  }
  if (status === NOT_FOUND) {
    return (
      <div>
        not found
      </div>
    )
  }
  return (
    <div className="mt-8 mx-8 flex flex-col items-center justify-around space-y-2 text-center">
      <div>{`+${tlr}.${subrealmname}`}</div>
      <SubrealmPFP imageSrc={imageSrc} />
      <div>{profileName}</div>
      <div>{description}</div>
      <Wallets wallets={walletsObject} />
    </div>
  )
}

export default Profile