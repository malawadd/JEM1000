<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { executeQuery } from '@/services/graphql'
import { formatCurrency } from '@/utils/formatters'

const appStore = useAppStore()
const vaultStatuses = ref([])
const loading = ref(false)

const VAULT_STATUS_QUERY = `
	query GetVaultStatus($first: Int!) {
		vaultStatuses(first: $first, orderBy: totalSupply, orderDirection: desc) {
			id
			vault { symbol }
			totalSupply
			totalBorrows
			cash
			interestRate
			lastInterestAccumulatorUpdate
		}
	}
`

const fetchVaultStatus = async () => {
	loading.value = true
	try {
		const data = await executeQuery(appStore.selectedChain, VAULT_STATUS_QUERY, { first: 20 })
		vaultStatuses.value = data.vaultStatuses || []
	} catch (error) {
		appStore.setError(error.message)
	} finally {
		loading.value = false
	}
}

onMounted(fetchVaultStatus)
watch(() => appStore.selectedChain, fetchVaultStatus)
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Text size="16" weight="600" color="primary">Cash vs Debt</Text>
		
		<div v-if="loading" :class="$style.loading">Loading...</div>
		
		<Flex direction="column" gap="8" v-else>
			<div v-for="status in vaultStatuses" :key="status.id" :class="$style.status">
				<Flex direction="column" gap="6">
					<Text size="14" weight="600" color="primary">{{ status.vault.symbol }}</Text>
					<Flex align="center" justify="between">
						<Flex direction="column" gap="2">
							<Text size="11" color="tertiary">Cash</Text>
							<Text size="12" weight="500" color="green">
								{{ formatCurrency(status.cash) }}
							</Text>
						</Flex>
						<Flex direction="column" gap="2" align="end">
							<Text size="11" color="tertiary">Debt</Text>
							<Text size="12" weight="500" color="orange">
								{{ formatCurrency(status.totalBorrows) }}
							</Text>
						</Flex>
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

.status {
	padding: 12px;
	border: 1px solid var(--op-10);
	border-radius: 8px;
}
</style>