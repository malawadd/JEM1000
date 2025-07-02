<script setup>
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { fetchVaultStatus } from "@/services/api/euler"
import { useAppStore } from "@/stores/app"

const appStore = useAppStore()
const router = useRouter()
const vaults = ref([])

const formatAmount = (amount) => {
	const num = parseFloat(amount) / 1e18
	if (num > 1e9) return `${(num/1e9).toFixed(2)}B`
	if (num > 1e6) return `${(num/1e6).toFixed(2)}M`
	if (num > 1e3) return `${(num/1e3).toFixed(2)}K`
	return num.toFixed(2)
}

const navigateToVault = (vaultId) => {
	const cleanVaultId = vaultId.split('-')[0] // Extract vault address from composite ID
	router.push(`/dashboard/vault/${cleanVaultId}`)
}

const loadVaults = async () => {
	try {
		const data = await fetchVaultStatus()
		vaults.value = data.vaultStatuses || []
	} catch (error) {
		console.error('Failed to load vault data:', error)
	}
}

onMounted(loadVaults)
watch(() => appStore.network, loadVaults)
</script>

<template>
	<div :class="$style.container">
		<Flex direction="column" gap="24">
			<Text size="24" weight="700" color="primary">VAULT ANALYTICS SYSTEM</Text>

			<div :class="$style.grid">
				<div :class="$style.card">
					<Text size="14" weight="600" color="tertiary">ACTIVE VAULTS</Text>
					<Text size="32" weight="700" color="primary" mono>{{ vaults.length }}</Text>
				</div>

				<div :class="$style.card">
					<Text size="14" weight="600" color="tertiary">TOTAL CASH</Text>
					<Text size="32" weight="700" color="green" mono>
						{{ formatAmount(vaults.reduce((acc, v) => acc + parseFloat(v.cash), 0).toString()) }}
					</Text>
				</div>

				<div :class="$style.card">
					<Text size="14" weight="600" color="tertiary">TOTAL BORROWS</Text>
					<Text size="32" weight="700" color="orange" mono>
						{{ formatAmount(vaults.reduce((acc, v) => acc + parseFloat(v.totalBorrows), 0).toString()) }}
					</Text>
				</div>
			</div>

			<div :class="$style.vaultGrid">
				<div 
					v-for="vault in vaults.slice(0, 12)" 
					:key="vault.id" 
					:class="$style.vaultCard"
					@click="navigateToVault(vault.id)"
				>
					<Flex direction="column" gap="12">
						<Flex align="center" justify="between">
							<Text size="12" weight="700" color="tertiary" mono>
								VAULT {{ vault.id.slice(0, 8) }}...
							</Text>
							<Icon name="arrow-top-right" size="12" color="secondary" />
						</Flex>
						
						<Flex justify="between">
							<Text size="11" weight="500" color="secondary">CASH</Text>
							<Text size="11" weight="600" color="green" mono>
								{{ formatAmount(vault.cash) }}
							</Text>
						</Flex>

						<Flex justify="between">
							<Text size="11" weight="500" color="secondary">BORROWS</Text>
							<Text size="11" weight="600" color="orange" mono>
								{{ formatAmount(vault.totalBorrows) }}
							</Text>
						</Flex>

						<div :class="$style.utilizationBar">
							<div 
								:class="$style.utilizationFill"
								:style="{ 
									width: `${Math.min(100, (parseFloat(vault.totalBorrows) / parseFloat(vault.cash)) * 100)}%` 
								}"
							/>
						</div>
					</Flex>
				</div>
			</div>
		</Flex>
	</div>
</template>

<style module>
.container {
	max-width: 1400px;
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 20px;
}

.card {
	background: linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%);
	border: 1px solid rgba(0, 255, 255, 0.2);
	border-radius: 8px;
	padding: 24px;
}

.vaultGrid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
}

.vaultCard {
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(0, 255, 157, 0.2);
	border-radius: 6px;
	padding: 16px;
	transition: all 0.2s ease;
	cursor: pointer;
}

.vaultCard:hover {
	border-color: rgba(0, 255, 157, 0.4);
	box-shadow: 0 0 20px rgba(0, 255, 157, 0.1);
	transform: translateY(-2px);
}

.utilizationBar {
	height: 4px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 2px;
	overflow: hidden;
}

.utilizationFill {
	height: 100%;
	background: linear-gradient(90deg, #00ff9d, #ffaa00);
	transition: width 0.3s ease;
}
</style>