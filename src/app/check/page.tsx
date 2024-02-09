"use client"
import { useContext, useEffect, useState } from "react";
import axios from 'axios'
import { Input } from "@nextui-org/react";
import { NetworkContext } from "@/common/NetworkContextProvider";

export default function Check () {

  const [realmName, setRealmName] = useState('')
  const [atomicalId, setAtomicalId] = useState('')
  const [fullRealmName, setFullRealmName] = useState('')
  const [pageState, setPageState] = useState('ready')
  const { network, api_endpoint } = useContext(NetworkContext)

  const fetchSubrealms = async () => {
    setPageState('loading')
    const response = await axios.get(`${api_endpoint}/blockchain.atomicals.get_realm_info?params=[\"${realmName}\",1]`)
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
    <div className="mt-4">
      <Input
        placeholder="Check realms and subrealms..."
        disabled={pageState === 'loading'}
        value={realmName}
        onChange={e => setRealmName(e.target.value)}
        onKeyUp={(e) => {
          console.log(e.key, realmName)
          if ( e.key === 'Enter' && realmName !== '' )
            fetchSubrealms()
        }}
        // contentRight={<Loading size="xs" />}
      />

      <div className="mt-4">
        {
          pageState === 'loading' ? 'searching' : (!atomicalId ? 'This is still available !!!' : 'This has been already claimed ...')
        }
      </div>

      <div className="flex flex-row justify-between mt-5">
        <div>
          { pageState === 'loading' ? 'searching' : atomicalId }
        </div>

        <div>
          { pageState === 'loading' ? 'searching' : fullRealmName }
        </div>
      </div>

    </div>
  )
}