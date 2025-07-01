<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { executeQuery } from '@/services/graphql'
import { formatTimeAgo, formatNumber, truncateAddress } from '@/utils/formatters'

const appStore = useAppStore()
const swaps = ref([])
const loading = ref(false)

const since = ref(Math.floor(Date.now() / 1000) - 86400) // 24h ago

const SWAPS_QUERY = `
	query GetSwaps($since: Int!, $first: Int!) {
		eulerSwaps(
			where: { blockTimestamp_gte: $since }
			first: $first
			orderBy: blockTimestamp
			orderDirection: desc
		) {
			id
			account
			tokenIn
			tokenOut
			amountIn
			amountOut
			blockTimestamp
			transactionHash
		}
	}
`

const fetchSwaps = async () => {
	loading.value = true
	try {
		const data = await executeQuery(appStore.selectedChain, SWAPS_QUERY, { 
			since: since.value, 
			first: 50 
		})
		swaps.value = data.eulerSwaps || []
	} catch (error) {
		appStore.setError(error.message)
	} finally {
		loading.value = false
	}
}

onMounted(fetchSwaps)
watch(() => appStore.selectedChain, fetchSwaps)
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Flex align="center" justify="between">
			<Text size="16" weight="600" color="primary">Recent Swaps</Text>
			<Text size="12" color="tertiary">{{ swaps.length }} in 24h</Text>
		</Flex>
		
		<div v-if="loading" :class="$style.loading">Loading...</div>
		
		<Flex direction="column" gap="6" v-else>
			<div v-for="swap in swaps" :key="swap.id" :class="$style.swap">
				<Flex align="center" justify="between">
					<Flex direction="column" gap="2">
						<Text size="12" weight="500" color="primary">
							{{ formatNumber(swap.amountIn) }} → {{ formatNumber(swap.amountOut) }}
						</Text>
						<Text size="10" color="support">{{ truncateAddress(swap.account) }}</Text>
					</Flex>
					<Text size="10" color="tertiary">{{ formatTimeAgo(swap.blockTimestamp) }}</Text>
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
}

.loading {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200px;
	color: var(--txt-secondary);
}

.swap {
	padding: 8px;
	border: 1px solid var(--op-5);
	border-radius: 4px;
}
</style>