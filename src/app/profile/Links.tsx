"use client"
import { useEffect, useState } from "react"

export const Links = ({linksObject}: {linksObject: any}) => {

  const [linkList, setLinkList] = useState<any[]>([])

  useEffect(() => {
    let arr: any = []
    if (linksObject) {
      Object.keys(linksObject).map((idx: any) => {
        const { group, items } = linksObject[idx]
        if (items) {
          Object.keys(items).map((idx_: any) => {
            arr.push({
              name: items[idx_]["name"],
              url: items[idx_]["url"],
              type: items[idx_]["type"]
            })
          })
        }
      })
      setLinkList(arr)
    }
  }, [])

  return (
    <div>
      {
        linkList && linkList.map((elem: any) => (
          <div key={elem.type}>
            <div>{elem.name}</div>
            <div>{elem.url}</div>
            <div>{elem.type}</div>
          </div>
        ))
      }
    </div>
  )
}