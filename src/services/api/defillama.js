// DeFiLlama API service with caching
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
const cache = new Map()

const getCachedData = (key) => {
	const cached = cache.get(key)
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data
	}
	return null
}

const setCachedData = (key, data) => {
	cache.set(key, {
		data,
		timestamp: Date.now()
	})
}

export const fetchProtocolData = async () => {
	const cacheKey = 'protocol-data'
	const cached = getCachedData(cacheKey)
	if (cached) {
		console.log('Returning cached protocol data')
		return cached
	}

	try {
		const response = await fetch('https://api.llama.fi/protocol/euler-v2')
		if (!response.ok) throw new Error('Failed to fetch protocol data')
		const data = await response.json()
		setCachedData(cacheKey, data)
		return data
	} catch (error) {
		console.error('Error fetching protocol data:', error)
		throw error
	}
}

export const fetchFeesData = async () => {
	const cacheKey = 'fees-data'
	const cached = getCachedData(cacheKey)
	if (cached) {
		console.log('Returning cached fees data')
		return cached
	}

	try {
		const response = await fetch('https://api.llama.fi/summary/fees/euler-v2')
		if (!response.ok) throw new Error('Failed to fetch fees data')
		const data = await response.json()
		setCachedData(cacheKey, data)
		return data
	} catch (error) {
		console.error('Error fetching fees data:', error)
		throw error
	}
}

// Clear cache if needed
export const clearDefiLlamaCache = () => {
	cache.clear()
}

// Chain name mapping to match our app's network names
export const mapChainName = (appNetworkName) => {
	const chainMapping = {
		'mainnet': 'Ethereum',
		'base': 'Base',
		'arbitrum': 'Arbitrum',
		'avalanche': 'Avalanche',
		'sonic': 'Sonic',
		'bob': 'BOB',
		'berachain': 'Berachain',
		'unichain': 'Unichain',
		'bsc': 'Binance',
		'optimism': 'Optimism',
		'gnosis': 'Gnosis',
		'swell': 'Swellchain'
	}
	return chainMapping[appNetworkName] || appNetworkName
}