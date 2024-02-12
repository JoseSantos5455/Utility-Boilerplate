import { getRealmInfo } from "./poll-request"

export const realmExists = async (fullname: string, api_endpoint: string) => {
  if (!fullname)
    return false

  try {
    const result = await getRealmInfo(fullname, api_endpoint)
    const { atomical_id } = result
    if (atomical_id) {
      return true
    }
  } catch (err) {
    console.log(err)
    return false
  }
}

export const requestMintSubrealm = async (tlr: string, fullname: string, api_endpoint: string) => {
  try {
    const result = await getRealmInfo(fullname, api_endpoint)
    const { 
      missing_name_parts, 
      final_subrealm_name, 
      nearest_parent_realm_atomical_id, 
    } = result

    if (!nearest_parent_realm_atomical_id || missing_name_parts !=  final_subrealm_name) {
      return {
        status: 'error',
        msg: 'Cannot mint! - nearest parent missing !'
      }
    }

    
    const parent_info = await getRealmInfo(tlr, api_endpoint)
    const { nearest_parent_realm_subrealm_mint_allowed, nearest_parent_realm_subrealm_mint_rules } = parent_info
    const { current_height_rules } = nearest_parent_realm_subrealm_mint_rules

    if (!nearest_parent_realm_subrealm_mint_allowed) {
      return {
        status: 'error',
        msg: 'Cannot mint! - subrealm mint not allowed !'
      }
    }

    if (!current_height_rules || current_height_rules.length < 1) {
      return {
        status: 'error',
        msg: 'Cannot mint! - Invalid rules !'
      }
    }

    const [rule] = current_height_rules
    const {p, o, bitworkc, bitworkr } = rule
    if (p != '.*') {
      return {
        status: 'error',
        msg: 'Sorry, we support only \[\.\*\] regex patterns right now...'
      }
    }

    return {
      status: 'success',
      msg: 'success',
      rule
    }
  } catch (err) {
    console.log(err)
    return {
      status: 'error',
      msg: 'console error'
    }
  }
}