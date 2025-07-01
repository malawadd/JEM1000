<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { executeQuery } from '@/services/graphql'
import { formatTimeAgo, truncateAddress, formatCurrency } from '@/utils/formatters'

const appStore = useAppStore()
const liquidations = ref([])
const loading = ref(false)

const since = ref(Math.floor(Date.now() / 1000) - 86400) // 24h ago

const LIQUIDATIONS_QUERY = `
	query GetLiquidations($since: Int!, $first: Int!) {
		liquidates(
			where: { blockTimestamp_gte: $since }
			first: $first
			orderBy: blockTimestamp
			orderDirection: desc
		) {
			id
			liquidator
			violator
			vault { symbol }
			collateralForLiquidator
			repayAssets
			blockTimestamp
			transactionHash
		}
	}
`

const fetchLiquidations = async () => {
	loading.value = true
	try {
		const data = await executeQuery(appStore.selectedChain, LIQUIDATIONS_QUERY, { 
			since: since.value, 
			first: 50 
		})
		liquidations.value = data.liquidates || []
	} catch (error) {
		appStore.setError(error.message)
	} finally {
		loading.value = false
	}
}

onMounted(fetchLiquidations)
watch(() => appStore.selectedChain, fetchLiquidations)
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Flex align="center" justify="between">
			<Text size="16" weight="600" color="primary">Liquidations (24h)</Text>
			<Text size="12" color="tertiary">{{ liquidations.length }} total</Text>
		</Flex>
		
		<div v-if="loading" :class="$style.loading">Loading...</div>
		
		<Flex direction="column" gap="8" v-else>
			<div v-for="liq in liquidations.slice(0, 15)" :key="liq.id" :class="$style.liquidation">
				<Flex direction="column" gap="6">
					<Flex align="center" justify="between">
						<Text size="13" weight="600" color="red">{{ liq.vault.symbol }}</Text>
						<Text size="11" color="support">{{ formatTimeAgo(liq.blockTimestamp) }}</Text>
					</Flex>
					<Flex align="center" justify="between">
						<Text size="11" color="tertiary">{{ truncateAddress(liq.violator) }}</Text>
						<Text size="12" weight="500" color="secondary">
							{{ formatCurrency(liq.repayAssets) }}
						</Text>
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
}

.loading {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200px;
	color: var(--txt-secondary);
}

.liquidation {
	padding: 10px;
	border: 1px solid var(--op-5);
	border-radius: 6px;
	background: rgba(235, 87, 87, 0.05);
}
</style>