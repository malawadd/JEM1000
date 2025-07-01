<script setup>
import { ref, watch, onMounted } from "vue"
import { DateTime } from "luxon"
import { fetchAllVaults } from "@/services/api/euler"
import { useAppStore } from "@/stores/app"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Feed from "../local/Feed.vue"

const appStore = useAppStore()
const vaults = ref([])
const totalVaults = ref(0)
const totalSupplyCap = ref(0)

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
		const data = await fetchAllVaults()
		vaults.value = data.eulerVaults || []
		totalVaults.value = vaults.value.length
		totalSupplyCap.value = vaults.value.reduce((acc, vault) => acc + parseFloat(vault.supplyCap || '0'), 0)
	} catch (error) {
		console.error('Failed to load vaults:', error)
	}
}

onMounted(loadData)
watch(() => appStore.network, loadData)
</script>

<template>
	<Flex justify="between" :class="$style.wrapper">
		<Flex direction="column" gap="24" :class="$style.content">
			<Flex direction="column" gap="20">
				<Flex direction="column" gap="12">
					<svg width="348" height="22" viewBox="0 0 348 22" fill="none" xmlns="http://www.w3.org/2000/svg">
						<text x="10" y="16" fill="white" font-size="14" font-weight="600">Euler Finance Dashboard</text>
					</svg>

					<Flex align="center" gap="12">
						<Flex align="center" gap="8">
							<Text size="14" weight="500" color="tertiary">GraphQL API:</Text>
							<Flex align="center" gap="4">
								<Icon name="zap-circle" size="14" color="green" />
								<Text size="14" weight="600" color="green">Connected</Text>
							</Flex>
						</Flex>

						<div :class="$style.dot" />

						<Flex align="center" gap="8">
							<Text size="14" weight="500" color="tertiary">Network:</Text>
							<Text size="14" weight="600" color="secondary" style="text-transform: capitalize">
								{{ appStore.network }}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Dropdown fullWidth>
					<Flex align="center" gap="16" :class="$style.network_selector">
						<Flex align="center" gap="8">
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="7" cy="7" r="6" fill="#4CDC89" />
							</svg>
							<Text size="14" weight="600" color="primary" style="text-transform: capitalize">
								Euler {{ appStore.network }}
							</Text>
						</Flex>
						<Icon name="chevron" size="16" color="tertiary" />
					</Flex>

					<template #popup>
						<DropdownItem v-for="network in appStore.networks" :key="network.key" @click="appStore.network = network.key">
							<Flex align="center" gap="8">
								<Icon :name="appStore.network === network.key ? 'check' : ''" size="14" color="secondary" />
								{{ network.name }}
							</Flex>
						</DropdownItem>
					</template>
				</Dropdown>
			</Flex>

			<Feed />

			<Flex direction="column" gap="12">
				<Flex align="center" gap="40">
					<Flex direction="column" gap="8">
						<Text size="24" weight="500" color="primary" mono>{{ totalVaults }}</Text>
						<Text size="14" weight="500" color="tertiary">Total Vaults</Text>
					</Flex>
					<Flex direction="column" gap="8">
						<Text size="24" weight="500" color="primary" mono>{{ formatAmount(totalSupplyCap.toString()) }}</Text>
						<Text size="14" weight="500" color="tertiary">Supply Cap</Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex>

		<Flex direction="column" gap="16" :class="$style.vaults">
			<Text size="14" weight="600" color="primary">All Vaults</Text>
			<Flex direction="column" gap="8" :class="$style.vault_list">
				<div v-for="vault in vaults.slice(0, 10)" :key="vault.id" :class="$style.vault">
					<Flex justify="between" align="center">
						<Flex direction="column" gap="4">
							<Text size="14" weight="600" color="primary">{{ vault.symbol || vault.name }}</Text>
							<Text size="12" weight="500" color="tertiary">{{ formatAddress(vault.creator) }}</Text>
						</Flex>
						<Text size="12" weight="600" color="secondary">{{ formatAmount(vault.supplyCap) }}</Text>
					</Flex>
				</div>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background: var(--card-background);
	padding: 20px;
}

.content {
	flex: 1;
	z-index: 1;
}

.vaults {
	min-width: 300px;
	max-width: 300px;
}

.vault_list {
	max-height: 400px;
	overflow-y: auto;
}

.vault {
	padding: 12px;
	border-radius: 8px;
	background: var(--op-5);
	margin-bottom: 8px;
}

.dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: var(--op-10);
}

.network_selector {
	width: fit-content;
	height: 38px;
	border-radius: 10px;
	border: 2px solid var(--op-5);
	cursor: pointer;
	padding: 0 14px;
	transition: all 0.2s ease;
}

.network_selector:hover {
	border: 2px solid var(--op-10);
}

.network_selector:active {
	border: 2px solid var(--op-15);
	background: var(--op-5);
}
</style>