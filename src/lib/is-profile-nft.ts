export default function isProfileNft (elem: any) {
  if (typeof elem !== "object")
    return false

  const { fields } = elem.mint_data
  if (!fields || !fields['base_profile.json'])
    return false
  let nameFound, descFound, vFound, imageFound, linksFound
  try {
    Object.keys(fields).map((keyStr: string) => {
      if (keyStr === "name")
        nameFound = true
      if (keyStr === "desc")
        descFound = true
      if (keyStr === "v")
        vFound = true
      if (keyStr === "image")
        imageFound = true
      if (keyStr === "links")
        linksFound = true
    })
    return nameFound && descFound && vFound && imageFound && linksFound
  } catch (error) {
    return false
  }
}