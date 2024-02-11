"use client"
import { useContext, useEffect, useState, useCallback } from "react";
import { NetworkContext } from "@/common/NetworkContextProvider";
import axios from 'axios'
import { Input } from "@nextui-org/react";

export default function Explore () {

  const { network, api_endpoint } = useContext(NetworkContext)
  const [searchStr, setSearchStr] = useState('')
  const [items, setItems] = useState([])
  const [pageState, setPageState] = useState('ready')

  const fetchRealms = useCallback( async (endpoint: string, filter: string) => {
    console.log(`fetch is ${endpoint}`)
    setPageState('loading')

    try {
      const response = await axios.get(`${endpoint}/blockchain.atomicals.find_realms?params=[\"${filter}\",0]`)
      if (response.data && response.data.success) {
        const { success } = response.data
        if (success) {
          const { result } = response.data.response
          setItems(result)
        }
      }
    } catch (error) {
      console.log(error)
    } finally {
      setPageState('ready')      
    }
  }, [])

  useEffect(() => {
    console.log(`effect is ${network}`)
    fetchRealms(api_endpoint, searchStr)
  }, [api_endpoint])

  return (
    <div className="mt-4">
      <div>
        <Input
          color="default"
          placeholder="Search realm names here..."
          disabled={pageState === 'loading'}
          value={searchStr}
          onChange={e => setSearchStr(e.target.value)}
          onKeyUp={(e) => {
            if ( e.key === 'Enter' ) {
              fetchRealms(api_endpoint, searchStr)
            }
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