import { useContext, useEffect, useState } from "react"
import { AppContext } from "@/providers/AppContextProvider"

import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

export const ImageFromNFTAtomicalId = ({ imageSrc, dataLoading, additionalClass = "", isStorage = false }: { imageSrc: string, dataLoading?: boolean, additionalClass?: string, isStorage?: boolean }) => {

  const { network } = useContext(AppContext)
  const APIEndpoint = network === 'testnet' ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY

  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isSvg, setIsSvg] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!imageSrc)
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
        if (isStorage) {
          if (imageId.endsWith("i0"))
            imageId = imageId.substring(0, imageId.length - 2)
          const response = await fetch(`${APIEndpoint}/blockchain.transaction.get?params=["${imageId}",0]`);
          const apiData = await response.json();
          value = apiData.response
        }
        else {
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
        }
  
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

        // ... other code
      } catch (error) {
        console.error(`Error fetching data for: ${imageSrc}`);
      } finally {
        // setLoading(false);
      }
    }
    fetchData();
  }, [imageSrc])

  return (
    <div>
      {
        apiResponse ? (
          isSvg ? (
            <Image className={`${additionalClass} rounded-lg`} width={144} height={144} src={`data:image/svg+xml;base64,${apiResponse.base64ImageData}`} alt="Delegate Image" />
          ) : (
            <Image className={`${additionalClass} rounded-lg`} width={144} height={144} src={`data:image/png;base64,${apiResponse.base64ImageData}`} alt="Delegate Image" />
          )
        ) : (
          <Skeleton className="w-[144px] h-[144px]" />
        )
      }
    </div>
  )
}