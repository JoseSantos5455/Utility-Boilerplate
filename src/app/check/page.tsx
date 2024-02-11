"use client"
import { useContext, useEffect, useState } from "react";
import axios from 'axios'
import { NetworkContext } from "@/common/NetworkContextProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Check() {

  const [realmName, setRealmName] = useState('')
  const [atomicalId, setAtomicalId] = useState('')
  const [fullRealmName, setFullRealmName] = useState('')
  const [pageState, setPageState] = useState('ready')
  const { network, api_endpoint } = useContext(NetworkContext)
  const [progress, setProgress] = useState(0);

  const simulateProgress = () => {
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue = Math.min(progressValue + 7, 90);
      setProgress(progressValue);
    }, 10);
    setTimeout(() => {
      clearInterval(interval);
    }, 700);
  };

  const fetchSubrealms = async () => {
    setPageState('loading')
    simulateProgress();
    //const response = await axios.get(`${api_endpoint}/blockchain.atomicals.get_realm_info?params=[\"${realmName}\",1]`)
    const response = await axios.get(`https://ep.atomicals.xyz/proxy/blockchain.atomicals.get_realm_info?params=[\"${realmName}\",1]`)
    if (response.data && response.data.success) {
      const { result } = response.data.response
      const { atomical_id, found_full_realm_name } = result
      setAtomicalId(atomical_id)
      setFullRealmName(found_full_realm_name)
      setPageState('ready')
    }
  }

  return (
    <div className="mt-4 flex justify-center flex-col items-center">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Check realms and subrealms..."
          disabled={pageState === 'loading'}
          value={realmName}
          onChange={(e) => setRealmName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter' && realmName !== '') fetchSubrealms();
          }}
        />
        <Button onClick={fetchSubrealms}>Search</Button>
      </div>

      <div className="mt-4">
        {pageState === 'loading' ? (
          <div>
            <Progress className="w-40" value={progress} />

          </div>
        ) : !atomicalId ? (
          <div className="text-green-500">This is still available !!!</div>
        ) : (
          <div className="text-red-500">This has been already claimed ...</div>
        )}
      </div>

      <div className="flex flex-col mt-5">
        <div>
          <div className="text-gray-500">
            {pageState === 'loading' ? '' : fullRealmName}
          </div>
        </div>

        <div>
          <div className="text-gray-500">
            {pageState === 'loading' ? '' : atomicalId}
          </div>
        </div>
      </div>
    </div>
  );
}