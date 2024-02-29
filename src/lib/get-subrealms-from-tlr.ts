import axios from "axios"
import getAtomicalIdFromRealmname from "./get-atomical-id-from-realmname"

export default async function getSubrealmsFromTLR (tlr: string, network: string) {
  
  if (!tlr || tlr.length === 0)
    return []

  const tlrAtomicalId: string = await getAtomicalIdFromRealmname(tlr, network)

  if (!tlrAtomicalId)
    return []

  const APIEndpoint = `${network === "testnet" ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY}/blockchain.atomicals.find_subrealms?params=[\"${tlrAtomicalId}\"]`
  
  const response = await axios.get(APIEndpoint)

  if (response.data && response.data.success) {
    const { result } = response.data.response
    return result
  }

  return []

}