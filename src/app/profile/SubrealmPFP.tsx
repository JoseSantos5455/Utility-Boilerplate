import Image from "next/image"
import { useContext, useEffect, useState } from "react"
import { AppContext } from "@/common/AppContextProvider"
import { ApiError } from "next/dist/server/api-utils"

export const SubrealmPFP = ({ imageSrc }: { imageSrc: string }) => {

  const { network } = useContext(AppContext)
  const APIEndpoint = network === 'testnet' ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY

  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSvg, setIsSvg] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${APIEndpoint}/blockchain.atomicals.get_state?params=["${imageSrc}"]`);
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
        
  
        const latestFileData = apiData?.response?.result?.state?.latest && getLatestData(apiData.response.result.state.latest);
  
        const { value, isSvg: svgFlag } = getLatestData(apiData.response.result.state.latest);
  
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
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [])

  return (
    <div>
      {apiResponse ? (
        isSvg ? (
          <Image width={144} height={144} src={`data:image/svg+xml;base64,${apiResponse.base64ImageData}`} alt="Delegate Image" />
        ) : (
          <Image width={144} height={144} src={`data:image/png;base64,${apiResponse.base64ImageData}`} alt="Delegate Image" />
        )
      ) : (
        <Image className="m-auto rounded-lg" width={144} height={144} src={`/bull.jpg`} alt="" />
      )}
    </div>
  )
}