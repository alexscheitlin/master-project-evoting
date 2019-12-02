import axios from 'axios'

export const getBallotAddress = async () => {
  const data = await axios.get(process.env.AUTH_BACKEND_URL + '/deploy')
  return data.data.address
}
