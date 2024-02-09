"use client"
import { useContext, useEffect, useState } from "react";
import { NetworkContext } from "@/common/NetworkContextProvider";
import axios from 'axios'
import { Input } from "@nextui-org/react";

export default function Explore () {

  const { network, api_endpoint } = useContext(NetworkContext)
  const [searchStr, setSearchStr] = useState('')
  const [items, setItems] = useState([])
  const [pageState, setPageState] = useState('ready')

  const fetchRealms = async () => {
    console.log(`searching on ${network} with ${api_endpoint}`)
    setPageState('loading')
    const response = await axios.get(`${api_endpoint}/blockchain.atomicals.find_realms?params=[\"${searchStr}\",0]`)
    if (response.data && response.data.success) {
      const { success } = response.data
      if (success) {
        const { result } = response.data.response
        setItems(result)
      }
      setPageState('ready')
    }
  }

  useEffect(() => {
    fetchRealms()
  }, [api_endpoint])

  return (
    <div className="mt-4">
      <div>
        <Input
          // clearable
          // bordered
          color="default"
          placeholder="Search realm names here..."
          // labelPlaceholder="Search realms and subrealms..."
          disabled={pageState === 'loading'}
          // contentRight={<Loading size="xs" />}
          value={searchStr}
          onChange={e => setSearchStr(e.target.value)}
          onKeyUp={(e) => {
            if ( e.key === 'Enter' )
              fetchRealms()
          }}
        />
      </div>
      <div>
        {
          items.map((elem: any) => (
            <div key={elem.atomical_id} className="flex flex-row justify-between mt-5">
              <div>{elem.atomical_id}</div>
              <div>{elem.realm}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}