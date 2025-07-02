<script setup>
import { ref, watch, onMounted, computed } from "vue"
import { DateTime } from "luxon"
import { fetchAllEulerVaults, fetchVaultLatestTransaction, fetchVaultStatusByTxHash } from "@/services/api/vault"
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
		// Get all Euler vaults
		const vaultsData = await fetchAllEulerVaults(60)
		const eulerVaults = vaultsData.eulerVaults || []
		
		// For each vault, get latest status
		const vaultsWithStatusPromises = eulerVaults.map(async (vault) => {
			try {
				const transfersData = await fetchVaultLatestTransaction(vault.id)
				const latestTransfer = transfersData.transfers?.[0]
				
				if (latestTransfer) {
					const statusData = await fetchVaultStatusByTxHash(latestTransfer.transactionHash)
					const status = statusData.vaultStatuses?.[0]
					
					return {
						...vault,
						cash: status?.cash || '0',
						totalBorrows: status?.totalBorrows || '0'
					}
				}
				
				return {
					...vault,
					cash: '0',
					totalBorrows: '0'
				}
			} catch (error) {
				return {
					...vault,
					cash: '0',
					totalBorrows: '0'
				}
			}
		})
		
		const results = await Promise.all(vaultsWithStatusPromises)
		vaultData.value = results.slice(0, 60)
		maxCash.value = Math.max(...vaultData.value.map(v => parseFloat(v.cash)))
	} catch (error) {
		console.error('Failed to load vault status:', error)
	}
}

const barColor = (cash) => {
	const pct = (parseFloat(cash) * 100) / maxCash.value
	if (pct > 66) return '#12D87B'
	if (pct > 33) return '#F4C430'
	return '#FF4E4F'
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