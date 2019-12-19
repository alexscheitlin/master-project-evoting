import { create } from 'zustand'
import { Snack } from '../components/Snackbar'

export const [useErrorStore] = create((set, get) => ({
  show: false,
  message: '',
  variant: Snack.ERROR,
  open: (message: string, variant: Snack): void =>
    set({
      show: true,
      message: message,
      variant: variant,
    }),
  close: (variant: Snack): void =>
    set({
      show: false,
      message: '',
      variant: variant,
    }),
}))
