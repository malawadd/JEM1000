<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { executeQuery } from '@/services/graphql'
import { formatTimeAgo, truncateAddress } from '@/utils/formatters'

const appStore = useAppStore()
const newVaults = ref([])
const loading = ref(false)

const weekAgo = ref(Math.floor(Date.now() / 1000) - 604800) // 7 days ago

const NEW_VAULTS_QUERY = `
	query GetNewVaults($since: Int!, $first: Int!) {
		proxyCreateds(
			where: { blockTimestamp_gte: $since }
			first: $first
			orderBy: blockTimestamp
			orderDirection: desc
		) {
			id
			proxy
			creator
			blockTimestamp
			transactionHash
		}
	}
`

const fetchNewVaults = async () => {
	loading.value = true
	try {
		const data = await executeQuery(appStore.selectedChain, NEW_VAULTS_QUERY, { 
			since: weekAgo.value, 
			first: 30 
		})
		newVaults.value = data.proxyCreateds || []
	} catch (error) {
		appStore.setError(error.message)
	} finally {
		loading.value = false
	}
}

onMounted(fetchNewVaults)
watch(() => appStore.selectedChain, fetchNewVaults)
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Flex align="center" justify="between">
			<Text size="16" weight="600" color="primary">New Vaults (7d)</Text>
			<Text size="12" color="tertiary">{{ newVaults.length }} created</Text>
		</Flex>
		
		<div v-if="loading" :class="$style.loading">Loading...</div>
		
		<Flex direction="column" gap="8" v-else>
			<div v-for="vault in newVaults" :key="vault.id" :class="$style.newVault">
				<Flex align="center" justify="between">
					<Flex direction="column" gap="4">
						<Text size="13" weight="600" color="primary">{{ truncateAddress(vault.proxy) }}</Text>
						<Text size="11" color="tertiary">by {{ truncateAddress(vault.creator) }}</Text>
					</Flex>
					<Text size="11" color="support">{{ formatTimeAgo(vault.blockTimestamp) }}</Text>
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

.newVault {
	padding: 10px;
	border: 1px solid var(--op-5);
	border-radius: 6px;
	background: rgba(88, 86, 222, 0.05);
}
</style>