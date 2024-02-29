import axios from "axios"

export default async function getStateHistoryFromAtomicalId (atomicalId: string, network: string) {

  const APIEndpoint = `${network === "testnet" ? process.env.NEXT_PUBLIC_CURRENT_PROXY_TESTNET : process.env.NEXT_PUBLIC_CURRENT_PROXY}/blockchain.atomicals.get_state_history?params=[\"${atomicalId}\"]`

  const response = await axios.get(APIEndpoint)

  if (response.data && response.data.success) {
    const { history } = response.data.response.result.state
    return history
  }

  return []

}