"use client"
import { useEffect, useState } from "react";
import axios from 'axios'
import { Input } from "@nextui-org/react";

export default function Realms () {

  const [realmName, setRealmName] = useState('')
  const [atomicalId, setAtomicalId] = useState('')
  const [fullRealmName, setFullRealmName] = useState('')
  const [pageState, setPageState] = useState('ready')

  const fetchSubrealms = async () => {
    setPageState('loading')
    // const response = await axios.get(`https://ep.atomicals.xyz/proxy/blockchain.atomicals.get_realm_info?params=[\"${realmName}\",1]`)
    const response = await axios.get(`https://ep.atomicals.xyz/proxy/blockchain.atomicals.get_realm_info?params=[\"${realmName}\",1]`)
    if (response.data && response.data.success) {
      const { result } = response.data.response
      console.log(result)
      const { atomical_id, found_full_realm_name } = result
      setAtomicalId(atomical_id)
      setFullRealmName(found_full_realm_name)
      setPageState('ready')
    }
  }

  return (
    <div className="flex flex-col text-center">
      <Input
        disabled={pageState === 'loading'}
        value={realmName}
        onChange={e => setRealmName(e.target.value)}
        onKeyUp={(e) => {
          if ( e.key === 'Enter' && realmName !== '' )
            fetchSubrealms()
        }}
        // contentRight={<Loading size="xs" />}
      />

      <div>
        {
          pageState === 'loading' ? 'searching' : (!atomicalId ? 'This is still available !!!' : 'This has been already claimed ...')
        }
      </div>
      <div>
        { pageState === 'loading' ? 'searching' : atomicalId }
      </div>

      <div>
        { pageState === 'loading' ? 'searching' : fullRealmName }
      </div>

    </div>
  )
}