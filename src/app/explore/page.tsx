"use client"
import { useContext, useEffect, useState } from "react";

import { AppContext } from "@/providers/AppContextProvider";
import getSubrealmsFromTLR from "@/lib/get-subrealms-from-tlr";

import { Input } from "@/components/ui/input";
import { RealmCard } from "@/components/profile/RealmCard";

export default function Explore() {

  const fakeSkeletons: any[] = []
  for (let i = 0; i < 30; i++) {
    fakeSkeletons.push({
      atomical_id: `fake-skeleton-${i}`
    })
  }

  const { network, tlr } = useContext(AppContext)
  const [searchStr, setSearchStr] = useState('')
  const [items, setItems] = useState(fakeSkeletons)
  const [pageState, setPageState] = useState('loading')

  useEffect(() => {
    const firstFetch = async () => {
      setPageState('loading')
      const subrealms = await getSubrealmsFromTLR(tlr, network)
      setItems(subrealms)
      setPageState('ready')
    }
    firstFetch()
  }, [network])

  return (
    <div>
      <div className="mt-4 mx-16 lg:mx-auto text-center space-x-2 lg:w-4/12">
        <Input
          color="default"
          placeholder={`Search +${tlr} subrealms here...`}
          disabled={pageState === 'loading'}
          value={searchStr}
          onChange={e => setSearchStr(e.target.value)}
          onKeyUp={async (e) => {
            if (e.key === 'Enter') {
              const subrealms = await getSubrealmsFromTLR(tlr, network)
              setItems(subrealms)
            }
          }}
        />
        {
          items.length === 0 ? (
            <div className="mx-auto mt-16">No Subrealms Found...</div>
          ) : (<></>)
        }
      </div>
      <div className="mx-16 mt-4 grid lg:grid-cols-6 md:grid-cols-4 gap-4">
        {
          items.map((elem: any) => (
            <RealmCard filter={searchStr} key={elem.atomical_id} subrealmName={elem.subrealm} atomicalId={elem.atomical_id} />
          ))
        }
      </div>
    </div>
  )
}