import { executeGraphQLQuery } from "@/services/config"

// Cache for account details (can be refreshed periodically)
const accountCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const fetchAccountDetails = async (accountId) => {
	// Check cache first
	const cacheKey = accountId.toLowerCase()
	const cached = accountCache.get(cacheKey)
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		console.log(`Returning cached data for account ${accountId}`)
		return cached.data
	}

	const query = `
		query GetAccountDetails($account: Bytes!) {
			# Cash flow events
			deposits(where: { 
				or: [
					{ sender: $account },
					{ owner: $account }
				]
			}, first: 100, orderBy: blockTimestamp, orderDirection: desc) {
				id sender owner assets shares vault blockNumber blockTimestamp transactionHash
			}
			
			withdraws(where: { 
				or: [
					{ sender: $account },
					{ receiver: $account },
					{ owner: $account }
				]
			}, first: 100, orderBy: blockTimestamp, orderDirection: desc) {
				id sender receiver owner assets shares vault blockNumber blockTimestamp transactionHash
			}
			
			transfers(where: { 
				or: [
					{ from: $account },
					{ to: $account }
				]
			}, first: 100, orderBy: blockTimestamp, orderDirection: desc) {
				id from to value vault blockNumber blockTimestamp transactionHash
			}
			
			# Debt side events
			borrows(where: { account: $account }, first: 100, orderBy: blockTimestamp, orderDirection: desc) {
				id account assets vault blockNumber blockTimestamp transactionHash
			}
			
			repays(where: { account: $account }, first: 100, orderBy: blockTimestamp, orderDirection: desc) {
				id account assets vault blockNumber blockTimestamp transactionHash
			}
			
			interestAccrueds(where: { account: $account }, first: 50, orderBy: blockTimestamp, orderDirection: desc) {
				id account assets vault blockNumber blockTimestamp transactionHash
			}
			
			# Liquidation events
			liquidates(where: { 
				or: [
					{ violator: $account },
					{ liquidator: $account }
				]
			}, first: 50, orderBy: blockTimestamp, orderDirection: desc) {
				id liquidator violator collateral repayAssets yieldBalance blockNumber blockTimestamp transactionHash
			}
			
			# Current balances and debt
			trackingVaultBalances(where: { mainAddress: $account }, first: 50, orderBy: blockTimestamp, orderDirection: desc) {
				id mainAddress vault balance debt blockNumber blockTimestamp
			}
			
			# Earn & Swap events
			eulerEarnDeposits(where: { 
				or: [
					{ sender: $account },
					{ owner: $account }
				]
			}, first: 50, orderBy: blockTimestamp, orderDirection: desc) {
				id sender owner assets shares blockNumber blockTimestamp transactionHash
				eulerEarnVault { name symbol }
			}
			
			eulerEarnWithdraws(where: { 
				or: [
					{ sender: $account },
					{ receiver: $account },
					{ owner: $account }
				]
			}, first: 50, orderBy: blockTimestamp, orderDirection: desc) {
				id sender receiver owner assets shares blockNumber blockTimestamp transactionHash
				eulerEarnVault { name symbol }
			}
			
			eulerEarnHarvests(where: { harvester: $account }, first: 50, orderBy: blockTimestamp, orderDirection: desc) {
				id harvester totalAllocated totalYield totalLoss blockNumber blockTimestamp transactionHash
				eulerEarnVault { name symbol }
			}
			
			eulerSwaps(where: { sender: $account }, first: 50, orderBy: blockTimestamp, orderDirection: desc) {
				id sender amount0In amount1In amount0Out amount1Out pool blockNumber blockTimestamp transactionHash
			}
		}
	`

	try {
		const data = await executeGraphQLQuery(query, { account: accountId })
		
		// Cache the result
		accountCache.set(cacheKey, {
			data,
			timestamp: Date.now()
		})
		console.log(`Cached account data for ${accountId}`)
		
		return data
	} catch (error) {
		console.error('Failed to fetch account details:', error)
		throw error
	}
}

// Clear cache if needed
export const clearAccountCache = () => {
	accountCache.clear()
}

// Get cache size for debugging
export const getAccountCacheSize = () => {
	return accountCache.size
}