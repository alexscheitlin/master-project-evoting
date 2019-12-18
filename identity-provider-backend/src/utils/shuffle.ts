// https://bost.ocks.org/mike/shuffle/
export const shuffle = (array: any[]): any[] => {
  const arr = JSON.parse(JSON.stringify(array))
  let m: number = arr.length
  let i: number
  let t: any

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--)

    // And swap it with the current element.
    t = arr[m]
    arr[m] = arr[i]
    arr[i] = t
  }

  return arr
}
