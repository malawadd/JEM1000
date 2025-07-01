<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { executeQuery } from '@/services/graphql'
import { formatCurrency, truncateAddress } from '@/utils/formatters'

const appStore = useAppStore()
const whaleBalances = ref([])
const loading = ref(false)

const minBalance = ref("1000000") // $1M minimum

const WHALE_BALANCES_QUERY = `
	query GetWhaleBalances($minBalance: String!, $first: Int!) {
		trackingVaultBalances(
			where: { balance_gt: $minBalance }
			first: $first
			orderBy: balance
			orderDirection: desc
		) {
			id
			account
			vault { symbol }
			balance
			lastUpdateTimestamp
		}
	}
`

const fetchWhaleBalances = async () => {
	loading.value = true
	try {
		const data = await executeQuery(appStore.selectedChain, WHALE_BALANCES_QUERY, { 
			minBalance: minBalance.value, 
			first: 20 
		})
		whaleBalances.value = data.trackingVaultBalances || []
	} catch (error) {
		appStore.setError(error.message)
	} finally {
		loading.value = false
	}
}

onMounted(fetchWhaleBalances)
watch(() => appStore.selectedChain, fetchWhaleBalances)
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Text size="16" weight="600" color="primary">Whale Balances</Text>
		
		<div v-if="loading" :class="$style.loading">Loading...</div>
		
		<Flex direction="column" gap="8" v-else>
			<div v-for="whale in whaleBalances" :key="whale.id" :class="$style.whale">
				<Flex align="center" justify="between">
					<Flex direction="column" gap="4">
						<Text size="13" weight="600" color="primary">{{ whale.vault.symbol }}</Text>
						<Text size="11" color="tertiary">{{ truncateAddress(whale.account) }}</Text>
					</Flex>
					<Text size="14" weight="600" color="secondary">
						{{ formatCurrency(whale.balance) }}
					</Text>
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

.whale {
	padding: 12px;
	border: 1px solid var(--op-10);
	border-radius: 8px;
	background: rgba(255, 215, 0, 0.05);
}
</style>