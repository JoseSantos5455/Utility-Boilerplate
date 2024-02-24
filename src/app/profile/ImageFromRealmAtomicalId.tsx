import Image from "next/image"
import { useContext, useEffect, useState } from "react"
import { AppContext } from "@/common/AppContextProvider"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"

export const ImageFromRealmAtomicalId = ({ atomicalId = "", additionalClass = "" }: { atomicalId: string, additionalClass?: string }) => {

  const { network } = useContext(AppContext)
  const APIEndpoint = network === 'testnet' ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY

  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isSvg, setIsSvg] = useState(false);
  const [finding, setFinding] = useState(true)
  const [imageSrc, setImageSrc] = useState("")

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
    setFinding(false)
  }

  const getProfileDataFromDelegateId = async (delegateId: string) => {
    const url = `${APIEndpoint}/blockchain.atomicals.get?params=[\"${delegateId}\"]`
    const response = await axios.get(url)
    if (response.data && response.data.success) {
      const { mint_data } = response.data.response.result
      console.log(mint_data)
      const { name, desc, image, links, wallets, collections } = mint_data.fields

      if (image) {
        if (image.startsWith("atom:btc")) {
          const splits = image.split(":")
          setImageSrc(splits[splits.length - 1])
        }
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!atomicalId)
        return;
      const historyArray = await getStateHistoryFromAtomicalId(atomicalId)
      getRecursiveProfileData(historyArray)
    }
    if (atomicalId !== "")
      fetchData();
  }, [atomicalId])

  useEffect(() => {
    const refreshImage = async () => {
      if (!imageSrc || imageSrc === "undefined" || imageSrc === "")
        return;
      try {
        let imageId = imageSrc
        if (imageSrc.startsWith("atom:")) {
          const splits = imageSrc.split(":")
          imageId = splits[splits.length - 1]
        }
        if (imageId.indexOf("/") > -1)
          imageId = imageSrc.split("/")[0]
  
        let value: any, svgFlag = false
  
        const response = await fetch(`${APIEndpoint}/blockchain.atomicals.get_state?params=["${imageId}"]`);
          const apiData = await response.json();
    
          // Function to find the property after "latest" and fetch its "$d" items
          const getLatestData = (latestObject: any) => {
            let isSvg = false;
          
            for (const key in latestObject) {
              if (latestObject[key]?.$b) {
                if (key.endsWith('.svg')) {
                  isSvg = true;
                }
                return { value: latestObject[key].$b, isSvg };
              }
            }
          
            return { value: null, isSvg: false }; // Handle the case when no suitable property is found
          };
          
    
          // const latestFileData = apiData?.response?.result?.state?.latest && getLatestData(apiData.response.result.state.latest);
    
          const { value: latestValue, isSvg: isSvgLatest } = getLatestData(apiData.response.result.state.latest);
          value = latestValue
          svgFlag = isSvgLatest
  
          let base64ImageData;
  
        if (typeof value === 'string') {
          base64ImageData = Buffer.from(value, 'hex').toString('base64');
        } else if (typeof value === 'object' && value.$b) {
          base64ImageData = Buffer.from(value.$b, 'hex').toString('base64');
        } else {
          base64ImageData = ''; // Change this to the default value you want to use
        }
  
        setApiResponse({ base64ImageData, isSvg: svgFlag });
        setIsSvg(svgFlag); // Update isSvg state
  
      } catch (error) {
        
      }
    }
    if(!finding)
      refreshImage()
  }, [imageSrc])

  return (
    <div className="mx-auto">
      {
        apiResponse ? (
          isSvg ? (
            <Image className={`${additionalClass} rounded-lg`} width={144} height={144} src={`data:image/svg+xml;base64,${apiResponse.base64ImageData}`} alt="Delegate Image" />
          ) : (
            <Image className={`${additionalClass} rounded-lg`} width={144} height={144} src={`data:image/png;base64,${apiResponse.base64ImageData}`} alt="Delegate Image" />
          )
        ) : (
          <Skeleton className="w-[128px] h-[128px]" />
        )
      }
    </div>
  )
}