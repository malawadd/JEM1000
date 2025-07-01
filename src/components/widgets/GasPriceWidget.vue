<script setup>
import { ref, onMounted, watch } from "vue"
import { DateTime } from "luxon"
import { fetchSwaps } from "@/services/api/euler"
import { useAppStore } from "@/stores/app"

const appStore = useAppStore()
const swaps = ref([])
const totalVolume = ref(0)

const formatAmount = (amount) => {
	const num = parseFloat(amount) / 1e18
	if (num > 1e9) return `${(num/1e9).toFixed(1)}B`
	if (num > 1e6) return `${(num/1e6).toFixed(1)}M`
	if (num > 1e3) return `${(num/1e3).toFixed(1)}K`
	return num.toFixed(2)
}

const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

const loadData = async () => {
	try {
		const since = Math.floor(Date.now() / 1000) - (24 * 60 * 60) // 24h ago
		const data = await fetchSwaps(since.toString())
		swaps.value = data.eulerSwaps || []
		totalVolume.value = swaps.value.reduce((acc, swap) => {
			return acc + parseFloat(swap.amount0In) + parseFloat(swap.amount1In)
		}, 0)
	} catch (error) {
		console.error('Failed to load swaps:', error)
	}
}

onMounted(loadData)
watch(() => appStore.network, loadData)
</script>

<template>
	<Flex direction="column" justify="between" gap="16" :class="$style.wrapper">
		<Flex direction="column" gap="8">
			<Text size="16" weight="500" color="primary">Euler Swaps (24h)</Text>
			<Text size="13" weight="500" color="tertiary">Total Volume: {{ formatAmount(totalVolume.toString()) }}</Text>
		</Flex>

		<Flex direction="column" gap="8" :class="$style.swaps">
			<div v-for="swap in swaps.slice(0, 8)" :key="swap.id" :class="$style.swap">
				<Flex justify="between" align="center">
					<Flex direction="column" gap="4">
						<Text size="14" weight="600" color="primary">{{ formatAddress(swap.sender) }}</Text>
						<Text size="12" weight="500" color="tertiary">
							{{ DateTime.fromSeconds(parseInt(swap.blockTimestamp)).toRelative() }}
						</Text>
					</Flex>
					<Flex direction="column" align="end" gap="4">
						<Text size="14" weight="600" color="primary">
							{{ formatAmount(swap.amount0In) }}
						</Text>
						<Text size="12" weight="500" color="tertiary">
							→ {{ formatAmount(swap.amount0Out) }}
						</Text>
					</Flex>
				</Flex>
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	min-width: 500px;
	min-height: 220px;
	background: var(--card-background);
	padding: 20px;
}

.swaps {
	max-height: 300px;
	overflow-y: auto;
}

.swap {
	padding: 12px;
	border-radius: 8px;
	background: var(--op-5);
	margin-bottom: 8px;
}
</style>