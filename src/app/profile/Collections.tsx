"use client"
import { useEffect, useState } from "react"
import { ImageFromAtomicalId } from "./ImageFromNFTAtomicalId"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const Collections = ({collectionsObject}: {collectionsObject: any}) => {

  const [collections, setCollections] = useState<any[]>([])

  useEffect(() => {
    if (collectionsObject) {
      let arr: any = []
      Object.keys(collectionsObject).map((collectionName: any) => {
        const previewObject = collectionsObject[collectionName]["preview"]
        let collectionItem: any = {
          name: collectionsObject[collectionName]['name'],
          image: collectionsObject[collectionName]['image'],
          desc: collectionsObject[collectionName]['desc'],
        }
        let previews: any[] = []
        if (previewObject) {
          Object.keys(previewObject).map((previewIndex: any) => {
            let previewImage = previewObject[previewIndex].img.toString()
            if (previewImage && previewImage.startsWith("atom:btc")) {
              const splits = previewImage.split(":")
              previewImage = splits[3]
            }
            if (previewImage && previewImage.indexOf("/") > -1)
              previewImage = previewImage.split("/")[0]
            previews.push({img: previewImage})
          })
        }
        collectionItem['previews'] = previews
        arr.push(collectionItem)
      })
      setCollections(arr)
    }
    
  }, [collectionsObject])

  return (
    <div className="flex flex-col gap-12 mb-20">
      <div>Collections</div>
      {
        collections && collections.map((elem: any) => {
          const { name, image, desc, previews } = elem
          let collectionImage = ""
          if (image && image.startsWith("atom:btc")) {
            const splits = image.split(":")
            collectionImage = splits[3]
          }
          if (image && image.indexOf("/") > -1)
            collectionImage = collectionImage.split("/")[0]

          return (
            <div className="flex flex-col gap-4" key={`${name.toString()}${desc.toString()}`}>
              <div className="flex flex-row items-center justify-center">
                {/* <ImageFromAtomicalId isStorage={true} imageSrc={collectionImage.toString()} /> */}
                <div className="flex flex-col">
                  <div>{name.toString()}</div>
                  <div className="max-w-[240px]">{desc.toString()}</div>
                </div>
              </div>
              <div className="flex flex-row space-x-2 text-center justify-center">
                {
                  elem.previews.map((preview: any) => (
                    <ImageFromAtomicalId additionalClass="" key={`${name.toString()}${desc.toString()}${preview.img}`} imageSrc={preview.img.toString()} />
                  ))
                }
              </div>
              <Button><Link target="_blank" href={`https://wizz.cash/dmint/${name.toLowerCase()}`}>Show on Wizz</Link></Button>
            </div>  
          )
        })
      }
    </div>
  )
}