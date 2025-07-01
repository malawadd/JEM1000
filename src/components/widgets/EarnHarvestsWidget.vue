<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { executeQuery } from '@/services/graphql'
import { formatTimeAgo, formatCurrency } from '@/utils/formatters'

const appStore = useAppStore()
const harvests = ref([])
const loading = ref(false)

const HARVESTS_QUERY = `
	query GetHarvests($first: Int!) {
		eulerEarnHarvests(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
			id
			strategy
			strategyAsset
			yieldBalance
			blockTimestamp
			transactionHash
		}
	}
`

const fetchHarvests = async () => {
	loading.value = true
	try {
		const data = await executeQuery(appStore.selectedChain, HARVESTS_QUERY, { first: 30 })
		harvests.value = data.eulerEarnHarvests || []
	} catch (error) {
		appStore.setError(error.message)
	} finally {
		loading.value = false
	}
}

onMounted(fetchHarvests)
watch(() => appStore.selectedChain, fetchHarvests)
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Text size="16" weight="600" color="primary">Recent Earn Harvests</Text>
		
		<div v-if="loading" :class="$style.loading">Loading...</div>
		
		<Flex direction="column" gap="8" v-else>
			<div v-for="harvest in harvests" :key="harvest.id" :class="$style.harvest">
				<Flex align="center" justify="between">
					<Flex direction="column" gap="4">
						<Text size="13" weight="600" color="primary">{{ harvest.strategyAsset }}</Text>
						<Text size="11" color="support">{{ formatTimeAgo(harvest.blockTimestamp) }}</Text>
					</Flex>
					<Text size="12" weight="500" color="green">
						{{ formatCurrency(harvest.yieldBalance) }}
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

.harvest {
	padding: 10px;
	border: 1px solid var(--op-5);
	border-radius: 6px;
	background: rgba(10, 222, 113, 0.05);
}
</style>