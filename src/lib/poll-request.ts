import axios from "axios"

export const pollGet = async (uri: string, method: string) => {
  const response = await axios.get(uri)
  if (response.data && response.data.success) {
    const { result } = response.data.response
    return result
  }
  return null
}

export const getRealmInfo = async (fullname: string, api_endpoint: string) => {
  const result = await pollGet(`${api_endpoint}/blockchain.atomicals.get_realm_info?params=[\"${fullname}\",0]`, 'GET')
  return result
}