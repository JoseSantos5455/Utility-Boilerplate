"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/providers/AppContextProvider";

import { ImageFromNFTAtomicalId } from "../../../components/profile/ImageFromNFTAtomicalId";
import { Wallets } from "../../../components/profile/Wallets";
import { Links } from "../../../components/profile/Links";
import { Collections } from "../../../components/profile/Collections"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    if (!atomical_id || atomical_id === "undefined")
      return {
        verified: false,
        delegateId: ""
      }
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
      console.log(mint_data)
      const { name, desc, image, links, wallets, collections } = mint_data.fields

      if (name)
        setProfileName(name)
      if (desc)
        setDescription(desc)
      if (image) {
        if (image.startsWith("atom:btc")) {
          const splits = image.split(":")
          setImageSrc(splits[splits.length - 1])
        }
      }
      if (links) 
        setLinksObject(links)
      if (wallets)
        setWalletsObject(wallets)
      if (collections)
        setCollectionsObject(collections)
    }
  }

  const getStateHistoryFromAtomicalId = async (atomicalId: string) => {
    const url = `${APIEndpoint}/blockchain.atomicals.get_state_history?params=[\"${atomicalId}\"]`
    const response = await axios.get(url)
    if (response.data && response.data.success) {
      const { history } = response.data.response.result.state
      let arr: any[] = []
      history.map((elem: any) => {
        arr.push({
          tx_num: elem.tx_num,
          height: elem.height,
          delegate: elem.data.d
        })
      })
      arr.sort((elem1: any, elem2: any) => elem1.height - elem2.height)
      return arr
    }
    return []
  }

  const getRecursiveProfileData = async (delegateArray: any[]) => {
    let profileData: any = {}
    for (let i = 0; i < delegateArray.length; i++) {
      let { delegate }: { delegate: string} = delegateArray[i]
      if (!delegate || delegate === "" || delegate === "undefined")
        continue;
      if ( delegate.startsWith("atom:btc") ) {
        const splits = delegate.split(":")
        delegate = splits[splits.length - 1]
      }
      await getProfileDataFromDelegateId(delegate)
    }
    setStatus(FOUND)
  }

  useEffect(() => {
    const fetchData = async () => {
      // const atomicalId = await getAtomicalIdFromRealmname(`${tlr}.${subrealmname}`)
      const atomicalId = await getAtomicalIdFromRealmname(`${subrealmname}`)
      if (atomicalId === "") {
        setStatus(NOT_FOUND)
      }
      else {
        const historyArray = await getStateHistoryFromAtomicalId(atomicalId)
        console.log(historyArray)
        await getRecursiveProfileData(historyArray)
      }
    }
    fetchData()
  }, [network])

  if (status === NOT_FOUND) {
    return (
      <div>
        not found
      </div>
    )
  }
  return (
    <div className="lg:w-6/12 lg:mx-auto mt-8 mx-8 flex flex-col items-center justify-around gap-4 text-center">
      <div className="text-2xl">
        {`+${subrealmname}`}
      </div>
      <ImageFromNFTAtomicalId imageSrc={imageSrc} dataLoading={status === LOADING} />
      {
        status === LOADING ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <div className="text-2xl">{profileName}</div>
        )
      }
      {
        status === LOADING ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <div>{description}</div>
        )
      }
      <Separator />
      <Links linksObject={linksObject} />
      <Separator />
      <Wallets wallets={walletsObject} />
      <Separator />
      <Collections collectionsObject={collectionsObject} />
    </div>
  )
}

export default Profile