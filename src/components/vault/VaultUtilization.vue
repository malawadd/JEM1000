<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { fetchVaultStatus } from "@/services/api/vault"
import { useAppStore } from "@/stores/app"

const props = defineProps({
	vaultId: String
})

const appStore = useAppStore()
const vaultStatus = ref([])

const formatAmount = (amount) => {
	const num = parseFloat(amount) / 1e18
	if (num > 1e9) return `${(num/1e9).toFixed(2)}B`
	if (num > 1e6) return `${(num/1e6).toFixed(2)}M`
	if (num > 1e3) return `${(num/1e3).toFixed(2)}K`
	return num.toFixed(4)
}

const loadUtilizationData = async () => {
	try {
		const data = await fetchVaultStatus(props.vaultId)
		vaultStatus.value = data.vaultStatuses || []
	} catch (error) {
		console.error('Failed to load vault utilization:', error)
	}
}

onMounted(loadUtilizationData)
watch(() => appStore.network, loadUtilizationData)
watch(() => props.vaultId, loadUtilizationData)

const latestStatus = computed(() => vaultStatus.value[0] || {})

const utilizationRate = computed(() => {
	const cash = parseFloat(latestStatus.value.cash || '0')
	const borrows = parseFloat(latestStatus.value.totalBorrows || '0')
	if (cash === 0) return 0
	return ((borrows / cash) * 100).toFixed(2)
})

const efficiency = computed(() => {
	const rate = parseFloat(utilizationRate.value)
	if (rate > 90) return { level: 'CRITICAL', color: 'red' }
	if (rate > 70) return { level: 'HIGH', color: 'orange' }
	if (rate > 40) return { level: 'OPTIMAL', color: 'green' }
	return { level: 'LOW', color: 'blue' }
})
</script>

<template>
	<div :class="$style.container">
		<Flex direction="column" gap="24">
			<!-- Utilization Overview -->
			<div :class="$style.utilizationCard">
				<Text size="18" weight="700" color="primary">VAULT UTILIZATION</Text>
				
				<div :class="$style.utilizationMeter">
					<div :class="$style.meterTrack">
						<div 
							:class="$style.meterFill"
							:style="{ 
								width: `${Math.min(100, utilizationRate)}%`,
								background: `var(--${efficiency.color})`
							}"
						/>
					</div>
					<Text size="24" weight="700" color="primary" mono>{{ utilizationRate }}%</Text>
				</div>

				<div :class="$style.efficiencyBadge" :style="{ borderColor: `var(--${efficiency.color})` }">
					<Text size="12" weight="700" :color="efficiency.color">{{ efficiency.level }} EFFICIENCY</Text>
				</div>
			</div>

			<!-- Utilization Metrics -->
			<div :class="$style.metricsGrid">
				<div :class="$style.metricCard">
					<Text size="14" weight="600" color="green">AVAILABLE CASH</Text>
					<Text size="24" weight="700" color="green" mono>
						{{ formatAmount(latestStatus.cash || '0') }}
					</Text>
				</div>

				<div :class="$style.metricCard">
					<Text size="14" weight="600" color="orange">TOTAL BORROWED</Text>
					<Text size="24" weight="700" color="orange" mono>
						{{ formatAmount(latestStatus.totalBorrows || '0') }}
					</Text>
				</div>

				<div :class="$style.metricCard">
					<Text size="14" weight="600" color="purple">TOTAL SHARES</Text>
					<Text size="24" weight="700" color="purple" mono>
						{{ formatAmount(latestStatus.totalShares || '0') }}
					</Text>
				</div>
			</div>

			<!-- Utilization History -->
			<div :class="$style.historyCard">
				<Text size="16" weight="700" color="primary">UTILIZATION HISTORY</Text>
				
				<div :class="$style.historyChart">
					<div :class="$style.chartContainer">
						<div 
							v-for="(status, index) in vaultStatus.slice(0, 30)" 
							:key="status.id"
							:class="$style.historyBar"
							:style="{ 
								height: `${Math.max(5, (parseFloat(status.totalBorrows) / Math.max(parseFloat(status.cash), 1)) * 100)}%`,
								background: `linear-gradient(to top, 
									${(parseFloat(status.totalBorrows) / Math.max(parseFloat(status.cash), 1)) > 0.9 ? '#ff0000' : 
									  (parseFloat(status.totalBorrows) / Math.max(parseFloat(status.cash), 1)) > 0.7 ? '#ff6600' : 
									  (parseFloat(status.totalBorrows) / Math.max(parseFloat(status.cash), 1)) > 0.4 ? '#00ff9d' : '#0099ff'}, 
									rgba(0,0,0,0.3))`
							}"
						/>
					</div>
					<Text size="12" weight="500" color="tertiary">Utilization rate over time</Text>
				</div>
			</div>

			<!-- Risk Assessment -->
			<div :class="$style.riskCard">
				<Text size="16" weight="700" color="primary">RISK ASSESSMENT</Text>
				
				<div :class="$style.riskMetrics">
					<div :class="$style.riskItem">
						<Text size="12" weight="600" color="tertiary">LIQUIDITY RISK</Text>
						<Text size="14" weight="700" :color="utilizationRate > 85 ? 'red' : utilizationRate > 60 ? 'orange' : 'green'">
							{{ utilizationRate > 85 ? 'HIGH' : utilizationRate > 60 ? 'MEDIUM' : 'LOW' }}
						</Text>
					</div>

					<div :class="$style.riskItem">
						<Text size="12" weight="600" color="tertiary">INTEREST VOLATILITY</Text>
						<Text size="14" weight="700" color="blue">
							{{ vaultStatus.length > 5 ? 'STABLE' : 'UNKNOWN' }}
						</Text>
					</div>

					<div :class="$style.riskItem">
						<Text size="12" weight="600" color="tertiary">CAPACITY STATUS</Text>
						<Text size="14" weight="700" :color="utilizationRate > 90 ? 'red' : 'green'">
							{{ utilizationRate > 90 ? 'NEAR FULL' : 'AVAILABLE' }}
						</Text>
					</div>
				</div>
			</div>
		</Flex>
	</div>
</template>

<style module>
.container {
	max-width: 1200px;
}

.utilizationCard {
	background: linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%);
	border: 1px solid rgba(0, 255, 255, 0.2);
	border-radius: 8px;
	padding: 32px;
	text-align: center;
}

.utilizationMeter {
	margin: 24px 0;
	display: flex;
	flex-direction: column;
	gap: 16px;
	align-items: center;
}

.meterTrack {
	width: 100%;
	max-width: 400px;
	height: 20px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	overflow: hidden;
}

.meterFill {
	height: 100%;
	border-radius: 10px;
	transition: all 0.3s ease;
}

.efficiencyBadge {
	display: inline-block;
	padding: 8px 16px;
	border: 2px solid;
	border-radius: 20px;
	background: rgba(0, 0, 0, 0.3);
}

.metricsGrid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 20px;
}

.metricCard {
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	padding: 20px;
	text-align: center;
}

.historyCard {
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(0, 255, 157, 0.2);
	border-radius: 8px;
	padding: 24px;
}

.historyChart {
	margin-top: 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
}

.chartContainer {
	display: flex;
	align-items: end;
	gap: 2px;
	height: 150px;
	width: 100%;
	max-width: 600px;
}

.historyBar {
	flex: 1;
	min-height: 5px;
	border-radius: 2px 2px 0 0;
	opacity: 0.8;
	transition: opacity 0.2s ease;
}

.historyBar:hover {
	opacity: 1;
}

.riskCard {
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(255, 0, 255, 0.2);
	border-radius: 8px;
	padding: 24px;
}

.riskMetrics {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 20px;
	margin-top: 16px;
}

.riskItem {
	display: flex;
	flex-direction: column;
	gap: 8px;
	text-align: center;
	padding: 16px;
	background: rgba(255, 255, 255, 0.02);
	border-radius: 6px;
}
</style>