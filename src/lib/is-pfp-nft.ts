export default function isPfpNft (elem: any) {
  if (typeof elem !== "object")
    return false

  const { fields } = elem.mint_data
  if (!fields)
    return false

  let found = false
  try {
    Object.keys(fields).map((keyStr: string) => {
      if (keyStr !== "args") {
        if (keyStr.endsWith("jpg") || keyStr.endsWith("png") || keyStr.endsWith("webp") || keyStr.endsWith("jpeg") || keyStr.endsWith("ico")) {
          found = true
        }
      }
    })
    return found
  } catch (error) {
    return false
  }
}