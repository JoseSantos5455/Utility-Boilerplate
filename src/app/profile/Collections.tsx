"use client"
import { useEffect, useState } from "react"
import { SubrealmPFP } from "./SubrealmPFP"

export const Collections = ({collectionsObject}: {collectionsObject: any}) => {

  const [collections, setCollections] = useState<any[]>([])

  useEffect(() => {
    if (collectionsObject) {
      let arr: any = []
      Object.keys(collectionsObject).map((collectionName: any) => {
        const previewObject = collectionsObject[collectionName]["preview"]
        let collectionItem: any = {
          name: collectionsObject[collectionName]['name'],
          desc: collectionsObject[collectionName]['desc'],
        }
        let previews: any[] = []
        if (previewObject) {
          Object.keys(previewObject).map((previewIndex: any) => {
            previews.push(previewObject[previewIndex])
          })
        }
        collectionItem['previews'] = previews
        arr.push(collectionItem)
      })
      setCollections(arr)
    }
    
  }, [])

  useEffect(() => {
    console.log(collections)
  }, [collections])

  return (
    <div>
      {
        collections && collections.map((elem: any) => (
          <div key={elem.name.toString()}>
            <div>{elem.name.toString()}</div>
            <div>{elem.desc.toString()}</div>
            <div className="flex flex-row space-x-2">
              {
                elem.previews.map((preview: any) => (
                  <SubrealmPFP imageSrc={preview.img.split(":")[3].toString()} />
                ))
              }
            </div>
          </div>
        ))
      }
    </div>
  )
}