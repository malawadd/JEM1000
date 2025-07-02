<script setup>
import { ref, watch, onMounted } from "vue"
import { DateTime } from "luxon"
import { fetchVaultStatus } from "@/services/api/euler"
import { useAppStore } from "@/stores/app"

const appStore = useAppStore()
const vaultData = ref([])
const maxCash = ref(0)

const formatAmount = (amount) => {
	const num = parseFloat(amount) / 1e18
	if (num > 1e9) return `${(num/1e9).toFixed(1)}B`
	if (num > 1e6) return `${(num/1e6).toFixed(1)}M`
	if (num > 1e3) return `${(num/1e3).toFixed(1)}K`
	return num.toFixed(2)
}

const getData = async () => {
	try {
		const data = await fetchVaultStatus()
		const statuses = data.vaultStatuses || []
		
		// Group by vault and get latest status for each
		const vaultMap = new Map()
		statuses.forEach(status => {
			const vaultId = status.id.split('-')[0]
			if (!vaultMap.has(vaultId) || status.blockTimestamp > vaultMap.get(vaultId).blockTimestamp) {
				vaultMap.set(vaultId, status)
			}
		})
		
		vaultData.value = Array.from(vaultMap.values()).slice(0, 60)
		maxCash.value = Math.max(...vaultData.value.map(v => parseFloat(v.cash)))
	} catch (error) {
		console.error('Failed to load vault status:', error)
	}
}

const barColor = (cash) => {
  // % of the largest-cash vault
  const pct = (parseFloat(cash) * 100) / maxCash.value
  if (pct > 66)  return '#12D87B'   // big ⇒ bright-green
  if (pct > 33)  return '#F4C430'   // mid ⇒ amber
  return '#FF4E4F'                  // small ⇒ red
}

onMounted(getData)
watch(() => appStore.network, getData)
</script>

<template>
	<Flex direction="column" justify="between" gap="24" :class="$style.wrapper">
		<Flex justify="between">
			<Flex direction="column" gap="8">
				<Text size="16" weight="500" color="primary">Cash vs Debt</Text>
				<Text size="13" weight="500" color="tertiary">Highest cash: {{ formatAmount(maxCash.toString()) }}</Text>
			</Flex>

			<Flex direction="column" align="end" gap="8">
				<Text size="18" weight="600" color="primary" mono>{{ vaultData.length }}</Text>
				<Text size="13" weight="500" color="tertiary">Vaults</Text>
			</Flex>
		</Flex>

		<Flex gap="8" :class="$style.vaults">
			<Flex v-for="vault in vaultData" align="end" :class="$style.vault">
				<div
  :style="{
    height: `${vault.cash ? (parseFloat(vault.cash) * 100) / maxCash : 5}%`,
    background: barColor(vault.cash)
  }"
  :class="$style.bar"
/>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;
	width: 100%;
	min-height: 220px;
	background: var(--card-background);
	overflow: hidden;
	padding: 20px;
}

.vaults {
	position: absolute;
	left: 20px;
	bottom: 20px;
	min-height: 120px;
	height: 120px;
}

.vault {
	height: 100%;
}

.bar {
	width: 1px;
	height: 10px;
	background: var(--op-30);
}

.bar.active {
	background: var(--txt-secondary);
	box-shadow: 0 0 10px rgba(255, 255, 255, 50%);
}
</style>