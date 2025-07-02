import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { fetchAllEulerVaults, fetchVaultLatestTransaction, fetchVaultStatusByTxHash } from "@/services/api/vault"

export const useVaultsStore = defineStore("vaults", () => {
	const vaults = ref([])
	const loading = ref(false)
	const lastFetched = ref(0)
	const error = ref(null)

	// Cache duration: 5 minutes
	const CACHE_DURATION = 5 * 60 * 1000

	// Computed properties for easy access
	const totalCash = computed(() => {
		return vaults.value.reduce((acc, vault) => acc + parseFloat(vault.status?.cash || '0'), 0)
	})

	const totalBorrows = computed(() => {
		return vaults.value.reduce((acc, vault) => acc + parseFloat(vault.status?.totalBorrows || '0'), 0)
	})

	const activeVaultsCount = computed(() => {
		return vaults.value.length
	})

	const vaultsSortedByCash = computed(() => {
		return [...vaults.value].sort((a, b) => 
			parseFloat(b.status?.cash || '0') - parseFloat(a.status?.cash || '0')
		)
	})

	// Check if data is fresh
	const isDataFresh = () => {
		return Date.now() - lastFetched.value < CACHE_DURATION
	}

	// Load all vaults data with caching
	const loadAllVaultsData = async (forceRefresh = false) => {
		// Return early if data is fresh and not forcing refresh
		if (!forceRefresh && isDataFresh() && vaults.value.length > 0) {
			return
		}

		loading.value = true
		error.value = null

		try {
			console.log('Loading all vaults data...')
			
			// Step 1: Get all Euler vaults
			const vaultsData = await fetchAllEulerVaults(100)
			const eulerVaults = vaultsData.eulerVaults || []
			
			console.log(`Found ${eulerVaults.length} vaults`)

			// Step 2: Process vaults in batches to avoid overwhelming the API
			const batchSize = 5
			const processedVaults = []

			for (let i = 0; i < eulerVaults.length; i += batchSize) {
				const batch = eulerVaults.slice(i, i + batchSize)
				
				const batchPromises = batch.map(async (vault) => {
					try {
						// Get latest transaction hash from transfers
						const transfersData = await fetchVaultLatestTransaction(vault.id)
						const latestTransfer = transfersData.transfers?.[0]
						
						if (latestTransfer) {
							// Get vault status using the transaction hash
							const statusData = await fetchVaultStatusByTxHash(latestTransfer.transactionHash)
							const status = statusData.vaultStatuses?.[0]
							
							return {
								...vault,
								status: status || {
									cash: '0',
									totalBorrows: '0',
									totalShares: '0',
									interestRate: '0',
									accumulatedFees: '0',
									interestAccumulator: '0'
								}
							}
						}
						
						return {
							...vault,
							status: {
								cash: '0',
								totalBorrows: '0',
								totalShares: '0',
								interestRate: '0',
								accumulatedFees: '0',
								interestAccumulator: '0'
							}
						}
					} catch (error) {
						console.error(`Failed to load status for vault ${vault.id}:`, error)
						return {
							...vault,
							status: {
								cash: '0',
								totalBorrows: '0',
								totalShares: '0',
								interestRate: '0',
								accumulatedFees: '0',
								interestAccumulator: '0'
							}
						}
					}
				})

				const batchResults = await Promise.all(batchPromises)
				processedVaults.push(...batchResults)
				
				// Small delay between batches to be gentle on the API
				if (i + batchSize < eulerVaults.length) {
					await new Promise(resolve => setTimeout(resolve, 100))
				}
			}

			vaults.value = processedVaults
			lastFetched.value = Date.now()
			
			console.log(`Successfully loaded ${processedVaults.length} vaults with status`)
		} catch (err) {
			console.error('Failed to load vaults data:', err)
			error.value = err.message
		} finally {
			loading.value = false
		}
	}

	// Get vault by ID
	const getVaultById = (vaultId) => {
		return vaults.value.find(vault => vault.id === vaultId)
	}

	// Refresh data (force reload)
	const refreshData = () => {
		return loadAllVaultsData(true)
	}

	// Clear cache
	const clearCache = () => {
		vaults.value = []
		lastFetched.value = 0
		error.value = null
	}

	return {
		// State
		vaults,
		loading,
		error,
		lastFetched,
		
		// Computed
		totalCash,
		totalBorrows,
		activeVaultsCount,
		vaultsSortedByCash,
		
		// Actions
		loadAllVaultsData,
		getVaultById,
		refreshData,
		clearCache,
		isDataFresh
	}
})