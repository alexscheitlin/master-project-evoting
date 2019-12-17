// simulates a delay like an asyc call would
export const delay = (t: number): Promise<void> => new Promise(resolve => setTimeout(resolve, t))
