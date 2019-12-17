// https://codepen.io/code_monk/pen/FvpfI
const randHex = (length: number): string => {
  const maxLength = 4
  const min = Math.pow(16, Math.min(length, maxLength) - 1)
  const max = Math.pow(16, Math.min(length, maxLength)) - 1
  const n = Math.floor(Math.random() * (max - min + 1)) + min
  let r = n.toString(16)
  while (r.length < length) {
    r = r + randHex(length - maxLength)
  }
  return r
}

export const getRandomWalletAddress = () => {
  return '0x' + randHex(32)
}

// simulates a delay like an asyc call would
export const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t))
