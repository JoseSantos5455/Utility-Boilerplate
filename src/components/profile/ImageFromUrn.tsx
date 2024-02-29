import { useContext, useEffect, useState } from "react"
import { AppContext } from "@/providers/AppContextProvider"

import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

export const ImageFromUrn = ({ imageSrc, additionalClass = "" }: { imageSrc: string, additionalClass?: string }) => {

  const { network } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [imageUri, setImageUri] = useState<any>("")

  // useEffect(() => {
  //   const imageUri = `${network === 'testnet' ? (process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET?.replace("proxy", "urn")) : (process.env.NEXT_PUBLIC_CURRENT_PROXY?.replace("proxy", "urn"))}/${imageSrc}`
  //   const fetchImage = async () => {
  //     setLoading(true)
  //     const response = await fetch(imageUri);
  //     console.log(await response.json())
  //     // let base64ImageData = Buffer.from(response, 'hex').toString('base64');

  //   }
  //   fetchImage()
  // }, [imageSrc])

  return (
    <>
      <div>{imageSrc}</div>
      {
        loading ? (<Skeleton className="h-[144px] w-[144px]" />) : (<></>)
      }
      <div>
        {/* <img className={`${additionalClass} rounded-lg`} width={144} height={144} src={imageUri} alt="Delegate Image" /> */}
      </div>
    </>
  )
}