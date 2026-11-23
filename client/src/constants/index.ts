export const API_BASE_URL =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
    ? import.meta.env.VITE_API_URL
    : typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:4000'

export const WS_BASE_URL =
  import.meta.env.VITE_WS_URL !== undefined && import.meta.env.VITE_WS_URL !== ''
    ? import.meta.env.VITE_WS_URL
    : typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
      : 'ws://localhost:4000'

export const BOARD_COLORS = [
  '#fecaca', // red-200
  '#fed7aa', // orange-200
  '#fef08a', // yellow-200
  '#bbf7d0', // green-200
  '#bfdbfe', // blue-200
  '#ddd6fe', // violet-200
  '#f5d0fe', // fuchsia-200
]
