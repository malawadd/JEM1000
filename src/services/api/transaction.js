import { executeGraphQLQuery } from "@/services/config"

// Cache for transaction details (immutable data)
const transactionCache = new Map()

export const fetchTransactionDetails = async (txHash) => {
	// Check cache first
	if (transactionCache.has(txHash)) {
		console.log(`Returning cached data for transaction ${txHash}`)
		return transactionCache.get(txHash)
	}

	const query = `
		query GetTransactionDetails($txHash: Bytes!) {
			# Core transaction events
			deposits(where: { transactionHash: $txHash }) {
				id sender owner assets shares vault blockNumber blockTimestamp
			}
			borrows(where: { transactionHash: $txHash }) {
				id account assets vault blockNumber blockTimestamp
			}
			withdraws(where: { transactionHash: $txHash }) {
				id sender receiver owner assets shares vault blockNumber blockTimestamp
			}
			repays(where: { transactionHash: $txHash }) {
				id account assets vault blockNumber blockTimestamp
			}
			transfers(where: { transactionHash: $txHash }) {
				id from to value vault blockNumber blockTimestamp
			}
			
			# Liquidations
			liquidates(where: { transactionHash: $txHash }) {
				id liquidator violator collateral repayAssets yieldBalance blockNumber blockTimestamp
			}
			
			# Vault status updates
			vaultStatuses(where: { transactionHash: $txHash }) {
				id totalShares totalBorrows accumulatedFees cash interestAccumulator interestRate timestamp blockNumber blockTimestamp
			}
			
			# Interest events
			interestAccrueds(where: { transactionHash: $txHash }) {
				id account assets blockNumber blockTimestamp
			}
			
			# Euler Swap events
			eulerSwaps(where: { transactionHash: $txHash }) {
				id sender amount0In amount1In amount0Out amount1Out reserve0 reserve1 from to pool blockNumber blockTimestamp
			}
			
			# Euler Earn events
			eulerEarnDeposits(where: { transactionHash: $txHash }) {
				id sender owner assets shares blockNumber blockTimestamp
			}
			eulerEarnWithdraws(where: { transactionHash: $txHash }) {
				id sender receiver owner assets shares blockNumber blockTimestamp
			}
			eulerEarnHarvests(where: { transactionHash: $txHash }) {
				id timestamp harvester totalAllocated totalYield totalLoss blockNumber blockTimestamp
				eulerEarnVault { name symbol }
			}
			
			# Vault creation events
			evaultCreateds(where: { transactionHash: $txHash }) {
				id evault creator asset dToken blockNumber blockTimestamp
			}
			proxyCreateds(where: { transactionHash: $txHash }) {
				id proxy upgradeable implementation trailingData blockNumber blockTimestamp
			}
			
			# Tracking events
			callWithContexts(where: { transactionHash: $txHash }) {
				id selector vault mainAddress accounts type evc blockNumber blockTimestamp
			}
			
		}
	`

	try {
		const data = await executeGraphQLQuery(query, { txHash })
		
		// Cache the result since transaction data is immutable
		transactionCache.set(txHash, data)
		console.log(`Cached transaction data for ${txHash}`)
		
		return data
	} catch (error) {
		console.error('Failed to fetch transaction details:', error)
		throw error
	}
}

// Clear cache if needed (for development or memory management)
export const clearTransactionCache = () => {
	transactionCache.clear()
}

// Get cache size for debugging
export const getTransactionCacheSize = () => {
	return transactionCache.size
}