/**
 * Describe the Site Enum
 **/
export enum Site {
  CoinMarketCap = 'CoinMarketCap',
  CoinGecko = 'CoinGecko'
}

/**
 * Describe the Coin object
 **/
export interface Coin {
  id: string
  name: string
  symbol: string
  site: Site
}

export interface Alerter {
  newGemAlert(coin: Coin, link: string): void
}
