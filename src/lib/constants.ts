export const API_ENDPOINTS = {
  PRODUCTS: "https://not-contest-cdn.openbuilders.xyz/api/items.json",
  HISTORY: "https://not-contest-cdn.openbuilders.xyz/api/history.json",
  NO_HISTORY: "https://not-contest-cdn.openbuilders.xyz/api/no_history.json",
} as const

export const APP_CONFIG = {
  NAME: "Not Store",
  DESCRIPTION: "Telegram Mini App Store",
  CURRENCY: "NOT",
  PRICE_DIVISOR: 1,
  CACHE_TTL: 60 * 5,
} as const

export const ROUTES = {
  HOME: "/",
  SEARCH: "/search",
  CART: "/cart",
  ACCOUNT: "/account",
  PRODUCT: (id: number) => `/product/${id}`,
} as const
