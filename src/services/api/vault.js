import { executeGraphQLQuery } from "@/services/config"

// Vault-specific queries based on the schema
export const fetchVaultDetails = async (vaultId) => {
	const query = `
		query GetVaultDetails($vaultId: Bytes!) {
			eulerVaults(where: { id: $vaultId }) {
				id name symbol decimals borrowCap supplyCap asset oracle creator
				blockNumber blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { vaultId })
}

export const fetchVaultDeposits = async (vaultId, limit = 50) => {
	const query = `
		query GetVaultDeposits($vault: Bytes!, $limit: Int!) {
			deposits(where: { vault: $vault }, first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id sender owner assets shares blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { vault: vaultId, limit })
}

export const fetchVaultWithdraws = async (vaultId, limit = 50) => {
	const query = `
		query GetVaultWithdraws($vault: Bytes!, $limit: Int!) {
			withdraws(where: { vault: $vault }, first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id sender receiver owner assets shares blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { vault: vaultId, limit })
}

export const fetchVaultBorrows = async (vaultId, limit = 50) => {
	const query = `
		query GetVaultBorrows($vault: Bytes!, $limit: Int!) {
			borrows(where: { vault: $vault }, first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id account assets blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { vault: vaultId, limit })
}

export const fetchVaultRepays = async (vaultId, limit = 50) => {
	const query = `
		query GetVaultRepays($vault: Bytes!, $limit: Int!) {
			repays(where: { vault: $vault }, first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id account assets blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { vault: vaultId, limit })
}

export const fetchVaultTransfers = async (vaultId, limit = 50) => {
	const query = `
		query GetVaultTransfers($vault: Bytes!, $limit: Int!) {
			transfers(where: { vault: $vault }, first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id from to value blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { vault: vaultId, limit })
}

export const fetchVaultLiquidations = async (vaultId, limit = 50) => {
	const query = `
		query GetVaultLiquidations($vault: Bytes!, $limit: Int!) {
			liquidates(where: { collateral: $vault }, first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id liquidator violator repayAssets yieldBalance blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { vault: vaultId, limit })
}

export const fetchVaultStatus = async (vaultId) => {
	const query = `
		query GetVaultStatus($vaultId: String!) {
			vaultStatuses(where: { id_contains: $vaultId }, first: 10, orderBy: blockTimestamp, orderDirection: desc) {
				id totalShares totalBorrows cash accumulatedFees interestRate blockTimestamp
			}
		}
	`
	return executeGraphQLQuery(query, { vaultId })
}

export const fetchVaultInterestAccrued = async (vaultId, limit = 20) => {
	const query = `
		query GetVaultInterestAccrued($vault: Bytes!, $limit: Int!) {
			interestAccrueds(where: { account: $vault }, first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
				id account assets blockTimestamp transactionHash
			}
		}
	`
	return executeGraphQLQuery(query, { vault: vaultId, limit })
}