export const getParityUrl = (): string => {
  return `http://${process.env.PARITY_NODE_IP}:${process.env.PARITY_NODE_PORT}`
}
