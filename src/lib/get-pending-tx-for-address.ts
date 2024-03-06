import axios from "axios"

export default async function getPendingTransactionForAddress(address: string, network: string) {
  
  const APIEndpoint = `${network === "testnet" ? process.env.NEXT_PUBLIC_MEMPOOL_TESTNET_APIENDPOINT : process.env.NEXT_PUBLIC_MEMPOOL_APIENDPOINT}/address/${address}/txs/mempool`
  const response = await axios.get(APIEndpoint)
  return response.data
}