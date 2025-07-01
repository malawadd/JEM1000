export const formatCurrency = (value, decimals = 2) => {
	if (!value || isNaN(value)) return '$0'
	const num = parseFloat(value)
	if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`
	if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`
	if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`
	return `$${num.toFixed(decimals)}`
}

export const formatNumber = (value, decimals = 2) => {
	if (!value || isNaN(value)) return '0'
	return parseFloat(value).toLocaleString(undefined, { 
		minimumFractionDigits: 0, 
		maximumFractionDigits: decimals 
	})
}

export const truncateAddress = (address, start = 6, end = 4) => {
	if (!address) return ''
	return `${address.slice(0, start)}...${address.slice(-end)}`
}

export const formatTimeAgo = (timestamp) => {
	const now = Date.now() / 1000
	const diff = now - parseInt(timestamp)
	
	if (diff < 60) return `${Math.floor(diff)}s ago`
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
	return `${Math.floor(diff / 86400)}d ago`
}