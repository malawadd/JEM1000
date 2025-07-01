<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { executeQuery } from '@/services/graphql'
import { formatTimeAgo, truncateAddress, formatNumber } from '@/utils/formatters'

const appStore = useAppStore()
const transactions = ref([])
const loading = ref(false)

const TRANSACTIONS_QUERY = `
	query GetTransactions($first: Int!) {
		deposits(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
			id
			account
			vault { symbol }
			assets
			blockTimestamp
			transactionHash
		}
		borrows(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
			id
			account
			vault { symbol }
			assets
			blockTimestamp
			transactionHash
		}
		withdraws(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
			id
			account
			vault { symbol }
			assets
			blockTimestamp
			transactionHash
		}
	}
`

const combinedTransactions = computed(() => {
	const all = [
		...transactions.value.deposits?.map(tx => ({ ...tx, type: 'Deposit' })) || [],
		...transactions.value.borrows?.map(tx => ({ ...tx, type: 'Borrow' })) || [],
		...transactions.value.withdraws?.map(tx => ({ ...tx, type: 'Withdraw' })) || []
	]
	return all.sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp)).slice(0, 20)
})

const fetchTransactions = async () => {
	loading.value = true
	try {
		const data = await executeQuery(appStore.selectedChain, TRANSACTIONS_QUERY, { first: 100 })
		transactions.value = data
	} catch (error) {
		appStore.setError(error.message)
	} finally {
		loading.value = false
	}
}

onMounted(fetchTransactions)
watch(() => appStore.selectedChain, fetchTransactions)
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Text size="16" weight="600" color="primary">Latest Transactions</Text>
		
		<div v-if="loading" :class="$style.loading">Loading...</div>
		
		<Flex direction="column" gap="6" v-else>
			<div v-for="tx in combinedTransactions" :key="tx.id" :class="$style.transaction">
				<Flex align="center" justify="between">
					<Flex direction="column" gap="2">
						<Flex align="center" gap="6">
							<Text size="13" weight="600" :color="tx.type === 'Deposit' ? 'green' : tx.type === 'Borrow' ? 'orange' : 'red'">
								{{ tx.type }}
							</Text>
							<Text size="12" color="tertiary">{{ tx.vault.symbol }}</Text>
						</Flex>
						<Text size="11" color="support">{{ truncateAddress(tx.account) }}</Text>
					</Flex>
					<Flex direction="column" align="end" gap="2">
						<Text size="12" weight="500" color="secondary">
							{{ formatNumber(tx.assets) }}
						</Text>
						<Text size="10" color="support">{{ formatTimeAgo(tx.blockTimestamp) }}</Text>
					</Flex>
				</Flex>
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	background: var(--card-background);
	padding: 20px;
	border-radius: 12px;
	height: 100%;
	overflow: hidden;
}

.loading {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200px;
	color: var(--txt-secondary);
}

.transaction {
	padding: 8px 12px;
	border: 1px solid var(--op-5);
	border-radius: 6px;
	transition: border-color 0.2s;
}

.transaction:hover {
	border-color: var(--op-15);
}
</style>