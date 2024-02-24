"use client"
import Link from "next/link"
import { DynamicIcon } from "./DynamicIcon"
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
  }, [linksObject])

  return (
    <div className="flex lg:flex-row flex-col gap-8">
      {
        linkList && linkList.map((elem: any) => (
          <Link href={elem.url} target="_blank" key={`${elem.type}${elem.url}${elem.type}`}>
            <span className="flex flex-row items-center gap-2">
              <DynamicIcon url={elem.url} type={elem.type} />{elem.name}
            </span>
          </Link>
        ))
      }
    </div>
  )
}