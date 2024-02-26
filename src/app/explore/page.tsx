"use client"
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/common/AppContextProvider";
import axios from 'axios'
import { Input } from "@/components/ui/input";
import { RealmCard } from "@/components/RealmCard";

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
      await fetchSubrealms()
    }
    firstFetch()
  }, [network])

  const getAtomicalIdFromTLR = async () => {
    const APIEndpoint = `${network === "testnet" ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY}/blockchain.atomicals.get_realm_info?params=[\"${tlr}\"]`
    const response = await axios.get(APIEndpoint)
    if (response.data && response.data.success) {
      const { atomical_id } = response.data.response.result
      return atomical_id
    }
    return ""
  }

  const fetchSubrealms = async () => {
    const tlr_id = await getAtomicalIdFromTLR()

    let num = 0
    let found = false
    do {
      num ++
      console.log(num)
      const APIEndpoint = `${network === "testnet" ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY}/blockchain.atomicals.find_subrealms?params=[\"${tlr_id}\"]`
      try {
        const response = await axios.get(APIEndpoint)
        if (response.data && response.data.success) {
          found = true
          const { result } = response.data.response
          setItems(result)
          break;
        }
      } catch (error) {
        continue;
      } finally {
        if (found)
          setPageState('ready')
      }
    } while (!found && num < 5)

    if (!found) {
      setPageState('ready')
    }
  }

  return (
    <div>
      <div className="mt-4 mx-16 lg:mx-auto text-center space-x-2 lg:w-4/12">
        <Input
          color="default"
          placeholder={`Search +${tlr} subrealms here...`}
          disabled={pageState === 'loading'}
          value={searchStr}
          onChange={e => setSearchStr(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              fetchSubrealms()
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