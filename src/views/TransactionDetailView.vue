<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { DateTime } from "luxon"
import { fetchTransactionDetails } from "@/services/api/transaction"
import { useAppStore } from "@/stores/app"
import { getExplorerURL } from "@/services/general"

// Components
import TransactionFlowChart from "@/components/transaction/TransactionFlowChart.vue"
import ValueDistributionChart from "@/components/transaction/ValueDistributionChart.vue"
import EventCard from "@/components/transaction/EventCard.vue"
import UtilizationGauge from "@/components/transaction/UtilizationGauge.vue"

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const txHash = computed(() => route.params.txHash)
const searchTxHash = ref(route.params.txHash || '')
const transactionData = ref(null)
const loading = ref(true)
const error = ref(null)

const formatAddress = (addr) => `${addr.slice(0, 8)}...${addr.slice(-6)}`

// Process all events from transaction data
const allEvents = computed(() => {
	if (!transactionData.value) return []
	
	const events = []
	const data = transactionData.value
	
	// Add deposits
	data.deposits?.forEach(deposit => {
		events.push({ ...deposit, type: 'deposit' })
	})
	
	// Add borrows
	data.borrows?.forEach(borrow => {
		events.push({ ...borrow, type: 'borrow' })
	})
	
	// Add withdraws
	data.withdraws?.forEach(withdraw => {
		events.push({ ...withdraw, type: 'withdraw' })
	})
	
	// Add repays
	data.repays?.forEach(repay => {
		events.push({ ...repay, type: 'repay' })
	})
	
	// Add transfers
	data.transfers?.forEach(transfer => {
		events.push({ ...transfer, type: 'transfer' })
	})
	
	// Add liquidations
	data.liquidates?.forEach(liquidate => {
		events.push({ ...liquidate, type: 'liquidate' })
	})
	
	// Add swaps
	data.eulerSwaps?.forEach(swap => {
		events.push({ ...swap, type: 'swap' })
	})
	
	// Add earn deposits
	data.eulerEarnDeposits?.forEach(earnDeposit => {
		events.push({ ...earnDeposit, type: 'earn-deposit' })
	})
	
	// Add earn withdraws
	data.eulerEarnWithdraws?.forEach(earnWithdraw => {
		events.push({ ...earnWithdraw, type: 'earn-withdraw' })
	})
	
	// Sort by block timestamp
	return events.sort((a, b) => parseInt(a.blockTimestamp) - parseInt(b.blockTimestamp))
})

// Get transaction metadata
const transactionMeta = computed(() => {
	if (!allEvents.value.length) return null
	
	const firstEvent = allEvents.value[0]
	return {
		blockNumber: firstEvent.blockNumber,
		blockTimestamp: firstEvent.blockTimestamp,
		timestamp: DateTime.fromSeconds(parseInt(firstEvent.blockTimestamp))
	}
})

// Get vault status if available
const vaultStatus = computed(() => {
	return transactionData.value?.vaultStatuses?.[0] || null
})

// Get swap data for charts
const swapData = computed(() => {
	return transactionData.value?.eulerSwaps || []
})

// Get earn data for charts
const earnData = computed(() => {
	return [
		...(transactionData.value?.eulerEarnDeposits || []),
		...(transactionData.value?.eulerEarnWithdraws || [])
	]
})

const loadTransactionData = async () => {
	loading.value = true
	error.value = null
	transactionData.value = null

	if (!txHash.value) {
		loading.value = false
		return
	}
	
	try {
		const data = await fetchTransactionDetails(txHash.value)
		transactionData.value = data
	} catch (err) {
		console.error('Failed to load transaction details:', err)
		error.value = err.message
	} finally {
		loading.value = false
	}
}

const searchTransaction = () => {
	if (searchTxHash.value && searchTxHash.value !== txHash.value) {
		router.push({ name: 'transaction-detail', params: { txHash: searchTxHash.value } })
	}
}

const openInExplorer = () => {
	window.open(`${getExplorerURL(appStore.network)}/tx/${txHash.value}`, '_blank', 'noopener noreferrer')
}

onMounted(loadTransactionData)
watch(() => txHash.value, (newVal) => {
	searchTxHash.value = newVal || ''
	loadTransactionData()
})
watch(() => appStore.network, loadTransactionData)
</script>

<template>
	<div :class="$style.container">
		<Flex direction="column" gap="24">
			<!-- Header -->
			<Flex align="center" justify="between">
				<Flex direction="column" gap="8">
					<Text size="24" weight="700" color="primary">TRANSACTION ANALYSIS</Text>
					<Text size="14" weight="600" color="secondary" mono>{{ txHash }}</Text>
				</Flex>
				
				<Flex align="center" gap="12">
					<!-- Search Bar -->
					<div :class="$style.searchBar">
						<input
							type="text"
							v-model="searchTxHash"
							@keyup.enter="searchTransaction"
							placeholder="Enter transaction hash"
							:class="$style.searchInput"
						/>
						<button @click="searchTransaction" :class="$style.searchButton">
							<Icon name="arrow-top-right" size="16" color="primary" />
						</button>
					</div>

					<!-- External Explorer Link -->
					<button @click="openInExplorer" :class="$style.explorerLink">
						<Icon name="arrow-top-right" size="16" color="secondary" />
						<Text size="12" weight="700" color="secondary">VIEW ON EXPLORER</Text>
					</button>

					<router-link to="/dashboard/swap-positions" :class="$style.backLink">
					<Icon name="arrow-top-right" size="16" color="secondary" :rotate="180" />
					<Text size="12" weight="700" color="secondary">BACK TO DASHBOARD</Text>
				</router-link>
				</Flex>
			</Flex>

			<!-- Loading State -->
			<div v-if="loading" :class="$style.loadingCard">
				<div :class="$style.loadingSpinner" />
				<Text size="16" weight="600" color="tertiary">ANALYZING TRANSACTION...</Text>
			</div>

			<!-- Error State -->
			<div v-else-if="error" :class="$style.errorCard">
				<Icon name="zap" size="24" color="red" />
				<Text size="16" weight="600" color="red">FAILED TO LOAD TRANSACTION</Text>
				<Text size="14" weight="500" color="tertiary">{{ error }}</Text>
				<button @click="loadTransactionData" :class="$style.retryButton">
					<Text size="12" weight="700" color="secondary">RETRY</Text>
				</button>
			</div>

			<!-- Transaction Content -->
			<div v-else-if="allEvents.length > 0">
				<!-- Transaction Overview -->
				<div :class="$style.overviewCard">
					<Flex align="center" justify="between">
						<Flex direction="column" gap="8">
							<Text size="18" weight="700" color="primary">TRANSACTION OVERVIEW</Text>
							<Flex align="center" gap="16">
								<Text size="12" weight="500" color="tertiary">
									Block: {{ transactionMeta?.blockNumber }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ transactionMeta?.timestamp.toFormat('MMM dd, yyyy HH:mm:ss') }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ transactionMeta?.timestamp.toRelative() }}
								</Text>
							</Flex>
						</Flex>
						
						<div :class="$style.eventCount">
							<Text size="24" weight="700" color="green" mono>{{ allEvents.length }}</Text>
							<Text size="11" weight="500" color="tertiary">EVENTS</Text>
						</div>
					</Flex>
				</div>

				<!-- Charts Section -->
				<div v-if="swapData.length > 0 || earnData.length > 0 || vaultStatus" :class="$style.chartsGrid">
					<TransactionFlowChart :events="allEvents" :txHash="txHash" />
					
					<ValueDistributionChart 
						v-if="swapData.length > 0 || earnData.length > 0"
						:swapData="swapData" 
						:earnData="earnData" 
					/>
					
					<UtilizationGauge 
						v-if="vaultStatus"
						:vaultStatus="vaultStatus" 
					/>
				</div>

				<!-- Events Grid -->
				<div :class="$style.eventsSection">
					<Text size="18" weight="700" color="primary">TRANSACTION EVENTS</Text>
					
					<div :class="$style.eventsGrid">
						<EventCard
							v-for="(event, index) in allEvents"
							:key="event.id"
							:event="event"
							:type="event.type"
							:index="index"
						/>
					</div>
				</div>
			</div>

			<!-- No Events State -->
			<div v-else :class="$style.noEventsCard">
				<Icon name="check-circle" size="48" color="tertiary" />
				<Text size="18" weight="700" color="tertiary">NO EVENTS FOUND</Text>
				<Text size="14" weight="500" color="support">
					This transaction hash doesn't contain any tracked events on {{ appStore.network }}.
				</Text>
			</div>
		</Flex>
	</div>
</template>

<style module>
.container {
	max-width: 1400px;
}

.searchBar {
	display: flex;
	align-items: center;
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(0, 255, 157, 0.2);
	border-radius: 6px;
	padding: 4px;
}

.searchInput {
	background: transparent;
	border: none;
	color: var(--txt-primary);
	padding: 6px 10px;
	font-size: 14px;
	flex-grow: 1;
	min-width: 200px;
}

.searchInput::placeholder {
	color: var(--txt-tertiary);
}

.searchButton {
	background: rgba(0, 255, 157, 0.1);
	border: 1px solid rgba(0, 255, 157, 0.3);
	border-radius: 4px;
	padding: 6px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.searchButton:hover {
	background: rgba(0, 255, 157, 0.2);
	box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
}

.explorerLink {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: rgba(0, 170, 255, 0.1);
	border: 1px solid rgba(0, 170, 255, 0.3);
	border-radius: 6px;
	transition: all 0.2s ease;
	text-decoration: none;
	cursor: pointer;
}

.explorerLink:hover {
	background: rgba(0, 170, 255, 0.2);
	box-shadow: 0 0 15px rgba(0, 170, 255, 0.3);
}

.backLink {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: rgba(255, 0, 255, 0.1);
	border: 1px solid rgba(255, 0, 255, 0.3);
	border-radius: 6px;
	transition: all 0.2s ease;
	text-decoration: none;
}

.backLink:hover {
	background: rgba(255, 0, 255, 0.2);
	box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
}

.loadingCard {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	padding: 48px;
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(0, 255, 157, 0.2);
	border-radius: 8px;
}

.loadingSpinner {
	width: 32px;
	height: 32px;
	border: 3px solid rgba(0, 255, 157, 0.2);
	border-top: 3px solid #00ff9d;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.errorCard {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	padding: 48px;
	background: rgba(255, 0, 0, 0.1);
	border: 1px solid rgba(255, 0, 0, 0.3);
	border-radius: 8px;
}

.retryButton {
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 4px;
	padding: 8px 16px;
	transition: all 0.2s ease;
}

.retryButton:hover {
	background: rgba(255, 255, 255, 0.2);
}

.overviewCard {
	background: linear-gradient(135deg, rgba(0, 255, 157, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%);
	border: 1px solid rgba(0, 255, 157, 0.2);
	border-radius: 8px;
	padding: 24px;
}

.eventCount {
	text-align: center;
	padding: 16px;
	background: rgba(0, 255, 157, 0.1);
	border: 1px solid rgba(0, 255, 157, 0.3);
	border-radius: 8px;
}

.chartsGrid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	gap: 20px;
}

.eventsSection {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.eventsGrid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 16px;
}

.noEventsCard {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	padding: 48px;
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	text-align: center;
}

@media (max-width: 768px) {
	.container {
		padding: 16px;
	}
	
	.chartsGrid {
		grid-template-columns: 1fr;
	}
	
	.eventsGrid {
		grid-template-columns: 1fr;
	}
}
</style>