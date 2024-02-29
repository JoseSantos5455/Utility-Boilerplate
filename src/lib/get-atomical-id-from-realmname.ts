import axios from "axios"

export default async function getAtomicalIdFromRealmname (realmname: string, network: string) {

  const APIEndpoint = `${network === "testnet" ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY}/blockchain.atomicals.get_realm_info?params=[\"${realmname}\"]`

  const response = await axios.get(APIEndpoint)

  if (response.data && response.data.success) {
    const { atomical_id } = response.data.response.result
    return atomical_id
  }

  return null

}