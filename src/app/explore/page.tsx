"use client"
import { useContext, useEffect, useState, useCallback } from "react";
import { NetworkContext } from "@/common/NetworkContextProvider";
import axios from 'axios'
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Explore() {

  const { network, api_endpoint } = useContext(NetworkContext)
  const [searchStr, setSearchStr] = useState('')
  const [items, setItems] = useState([])
  const [pageState, setPageState] = useState('ready')

  const fetchRealms = useCallback(async (endpoint: string, filter: string) => {
    console.log(`fetch is ${endpoint}`)
    setPageState('loading')

    try {
      const response = await axios.get(`https://ep.atomicals.xyz/proxy/blockchain.atomicals.find_realms?params=[\"${filter}\",0]`)
      //const response = await axios.get(`${endpoint}/blockchain.atomicals.find_realms?params=[\"${filter}\",0]`)
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
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          color="default"
          placeholder="Search realm names here..."
          disabled={pageState === 'loading'}
          value={searchStr}
          onChange={e => setSearchStr(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              fetchRealms(api_endpoint, searchStr)
            }
          }}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Realm</TableHead>
            <TableHead className="w-[100px]">Atomical ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((elem: any) => (
            <TableRow key={elem.atomical_id}>
              <TableCell>{elem.realm}</TableCell>
              <TableCell className="w-[100px]">{elem.atomical_id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}