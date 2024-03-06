import Image from "next/image";
import { useEffect, useState } from "react";

export default function ImageFromDataClickable({data, key, onClick = (f: any) => f }: {data: any, key?: any, onClick?: Function}) {

  const [imageData, setImageData] = useState<any>()
  const [isSvg, setIsSvg] = useState(false)

  useEffect(() => {
    if (data.type === "NFT") {
      if (!data.subtype) {
        const { fields } = data.mint_data
        Object.keys(fields).map((objKey: string) => {
          if (objKey !== "args" && fields[objKey]["$b"]) {
            setIsSvg(objKey.endsWith(".svg"))
            if (typeof fields[objKey]["$b"] === "object") {
              const { $d } = fields[objKey]["$b"]
              setImageData(Buffer.from($d, 'hex').toString('base64'))
            }
            else if (typeof fields[objKey]["$b"] === "string")
              setImageData(Buffer.from(fields[objKey]["$b"], 'hex').toString('base64'))
          }
        })
      }
      else if (data.subtype === "dmitem") {
        const { fields } = data.mint_data
        Object.keys(fields).map((objKey: string) => {
          if (objKey !== "args") {
            setIsSvg(objKey.endsWith(".svg"))
            const { $d } = fields[objKey]
            setImageData(Buffer.from($d, 'hex').toString('base64'))
          }
        })
      }
    }
  }, [data])
  
  return isSvg ? (
    <Image className="m-auto rounded-lg cursor-pointer" onClick={() => onClick(data)} width={144} height={144} src={`data:image/svg+xml;base64,${imageData}`} alt="" />
  ) : (
    <Image className="m-auto rounded-lg cursor-pointer" onClick={() => onClick(data)} width={144} height={144} src={`data:image/png;base64,${imageData}`} alt="" />
  )
}