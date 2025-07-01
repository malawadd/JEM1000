<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { executeQuery } from '@/services/graphql'
import { formatCurrency, truncateAddress } from '@/utils/formatters'

const appStore = useAppStore()
const vaults = ref([])
const loading = ref(false)

const VAULTS_QUERY = `
	query GetVaults($first: Int!) {
		eulerVaults(first: $first, orderBy: totalSupply, orderDirection: desc) {
			id
			asset
			symbol
			creator
			totalSupply
			totalBorrows
			supplyCap
			borrowCap
		}
	}
`

const fetchVaults = async () => {
	loading.value = true
	try {
		const data = await executeQuery(appStore.selectedChain, VAULTS_QUERY, { first: 50 })
		vaults.value = data.eulerVaults || []
	} catch (error) {
		appStore.setError(error.message)
	} finally {
		loading.value = false
	}
}

onMounted(fetchVaults)
watch(() => appStore.selectedChain, fetchVaults)
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Text size="16" weight="600" color="primary">All Vaults</Text>
		
		<div v-if="loading" :class="$style.loading">Loading...</div>
		
		<Flex direction="column" gap="8" v-else>
			<div v-for="vault in vaults.slice(0, 10)" :key="vault.id" :class="$style.vault">
				<Flex align="center" justify="between">
					<Flex direction="column" gap="4">
						<Text size="14" weight="600" color="primary">{{ vault.symbol }}</Text>
						<Text size="12" color="tertiary">{{ truncateAddress(vault.creator) }}</Text>
					</Flex>
					<Flex direction="column" align="end" gap="4">
						<Text size="13" weight="500" color="secondary">
							{{ formatCurrency(vault.totalSupply) }}
						</Text>
						<Text size="11" color="support">
							Cap: {{ formatCurrency(vault.supplyCap) }}
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

.vault {
	padding: 12px;
	border: 1px solid var(--op-10);
	border-radius: 8px;
	transition: border-color 0.2s;
}

.vault:hover {
	border-color: var(--op-20);
}
</style>