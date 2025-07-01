import { executeGraphQLQuery } from "@/services/config"

export const fetchLatestTransactions = async (limit = 50) => {
	const query = `
		query GetLatestTransactions($limit: Int!) {
			deposits: deposits(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id transactionHash blockTimestamp vault sender owner assets shares
			}
			borrows: borrows(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id transactionHash blockTimestamp vault account assets
			}
			withdraws: withdraws(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id transactionHash blockTimestamp vault sender receiver owner assets shares
			}
		}
	`
	return executeGraphQLQuery(query, { limit })
}

export const fetchLiquidations = async (since) => {
	const query = `
		query GetLiquidations($since: BigInt!) {
			liquidates(where: { blockTimestamp_gte: $since }, orderBy: blockTimestamp, orderDirection: desc) {
				id liquidator violator collateral repayAssets yieldBalance blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { since })
}

export const fetchVaultStatus = async () => {
	const query = `
		query GetVaultStatus {
			vaultStatuses(first: 100, orderBy: blockTimestamp, orderDirection: desc) {
				id totalShares totalBorrows cash accumulatedFees interestRate blockTimestamp
			}
		}
	`
	return executeGraphQLQuery(query)
}

export const fetchEarnHarvests = async (limit = 20) => {
	const query = `
		query GetEarnHarvests($limit: Int!) {
			eulerEarnHarvests(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id harvester totalAllocated totalYield totalLoss blockTimestamp transactionHash
				eulerEarnVault { name symbol }
			}
		}
	`
	return executeGraphQLQuery(query, { limit })
}

export const fetchSwaps = async (since) => {
	const query = `
		query GetSwaps($since: BigInt!) {
			eulerSwaps(where: { blockTimestamp_gte: $since }, orderBy: blockTimestamp, orderDirection: desc) {
				id sender amount0In amount1In amount0Out amount1Out pool blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { since })
}

export const fetchWhaleBalances = async (minBalance) => {
	const query = `
		query GetWhaleBalances($min: BigInt!) {
			trackingVaultBalances(where: { balance_gte: $min }, orderBy: balance, orderDirection: desc, first: 50) {
				id mainAddress vault balance debt blockTimestamp
			}
		}
	`
	return executeGraphQLQuery(query, { min: minBalance })
}

export const fetchNewVaults = async (since) => {
	const query = `
		query GetNewVaults($since: BigInt!) {
			proxyCreateds(where: { blockTimestamp_gte: $since }, orderBy: blockTimestamp, orderDirection: desc) {
				id proxy implementation blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { since })
}

export const fetchAllVaults = async () => {
	const query = `
		query GetAllVaults {
			eulerVaults(first: 100, orderBy: blockTimestamp, orderDirection: desc) {
				id name symbol borrowCap supplyCap asset creator blockTimestamp
			}
		}
	`
	return executeGraphQLQuery(query)
}