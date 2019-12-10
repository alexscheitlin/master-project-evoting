export const getParityUrl = (): string => {
  return 'http://localhost:' + process.env.SEALER_NODE_PORT
}
