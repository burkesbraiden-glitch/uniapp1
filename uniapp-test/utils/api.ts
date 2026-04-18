const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const API_BASE_URL = BASE_URL

export const getApiUrl = (path: string): string => {
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return `${BASE_URL}${path}`
  return `${BASE_URL}/${path}`
}

export const getImageUrl = (url: string): string => {
  if (!url) return 'https://via.placeholder.com/150'
  if (url.startsWith('http')) return url
  return `${BASE_URL}${url}`
}

export const isH5 = (): boolean => {
  if (typeof window === 'undefined') return false
  const ua = (window as any).navigator?.userAgent || ''
  return !/miniProgram/i.test(ua) && !/(?:App|Android|iPhone)/i.test(ua)
}

export const isApp = (): boolean => {
  if (typeof window === 'undefined') return false
  return (window as any).plus !== undefined
}

export const isWeixin = (): boolean => {
  if (typeof window === 'undefined') return false
  const ua = (window as any).navigator?.userAgent || ''
  return /MicroMessenger/i.test(ua) && /miniProgram/i.test(ua)
}