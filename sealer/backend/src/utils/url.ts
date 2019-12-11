export const getParityUrl = (): string => {
  return `http://${process.env.PARITY_NODE_IP}:${process.env.SEALER_NODE_PORT}`
}
