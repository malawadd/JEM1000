<script setup>
/** Vendor */
import { ref, watch, onMounted } from "vue"
import { DateTime } from "luxon"

/** Local Components */
import Globe from "../local/Globe.vue"
import Feed from "../local/Feed.vue"
import TPM from "../local/TPM.vue"

/** API */
import { fetchLatestTransactions } from "@/services/api/euler"

/** UI */
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Store */
import { useAppStore } from "@/stores/app"
const appStore = useAppStore()

const globeWidgetEl = ref(null)
const txs = ref([])

const fetchEulerTransactions = async () => {
	try {
		const data = await fetchLatestTransactions(20)
		const allTxs = [
			...data.deposits.map(tx => ({ ...tx, type: 'Deposit', message_types: ['Deposit'] })),
			...data.borrows.map(tx => ({ ...tx, type: 'Borrow', message_types: ['Borrow'] })),
			...data.withdraws.map(tx => ({ ...tx, type: 'Withdraw', message_types: ['Withdraw'] }))
		]
		
		// Sort by timestamp and take latest 10
		const sortedTxs = allTxs
			.sort((a, b) => b.blockTimestamp - a.blockTimestamp)
			.slice(0, 10)
			.map(tx => ({
				...tx,
				hash: tx.transactionHash,
				time: new Date(parseInt(tx.blockTimestamp) * 1000).toISOString(),
				signers: [tx.sender || tx.account || tx.owner],
				events_count: 1
			}))
		
		// Add new transactions to the globe
		if (sortedTxs.length > 0) {
			txs.value = [...sortedTxs, ...txs.value].slice(0, 20)
		}
	} catch (error) {
		console.error('Failed to fetch Euler transactions:', error)
	}
}

onMounted(() => {
	fetchEulerTransactions()
	// Update every minute instead of websocket
	setInterval(fetchEulerTransactions, 60_000)
})

watch(
	() => appStore.network,
	() => {
		txs.value = []
		fetchEulerTransactions()
	},
)
</script>

<template>
	<Flex ref="globeWidgetEl" justify="between" :class="$style.wrapper">
		<Globe v-if="globeWidgetEl" :parent="globeWidgetEl?.wrapper" :txs="txs" />
		<div :class="$style.atm_wrapper">
			<div :class="$style.atm" />
		</div>

		<Flex direction="column" gap="24" :class="$style.controls">
			<Flex direction="column" gap="20">
				<Flex direction="column" gap="12">
					<svg width="348" height="22" viewBox="0 0 348 22" fill="none" xmlns="http://www.w3.org/2000/svg">
						<text x="10" y="16" fill="#00ff9d" font-size="14" font-weight="700" font-family="monospace">EULER FINANCE DASHBOARD</text>
					</svg>

					<Flex align="center" gap="12">
						<Flex align="center" gap="8">
							<Text size="14" weight="500" color="tertiary"> GraphQL API: </Text>

							<Flex align="center" gap="4">
								<Icon name="zap-circle" size="14" color="green" />
								<Text size="14" weight="600" color="green"> CONNECTED </Text>
							</Flex>
						</Flex>

						<div :class="$style.dot" />

						<Flex align="center" gap="8">
							<Text size="14" weight="500" color="tertiary"> Network: </Text>
							<Flex align="center" gap="4">
								<Icon name="check-circle" size="14" color="secondary" />
								<Text size="14" weight="600" color="secondary" style="text-transform: uppercase"> {{ appStore.network }} </Text>
							</Flex>
						</Flex>
					</Flex>
				</Flex>

				<Flex align="center" gap="12">
					<Dropdown fullWidth height="300px" verticalOverflow>
						<Flex align="center" gap="16" :class="$style.network_selector">
							<Flex align="center" gap="8">
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="7" cy="7" r="6" :fill="appStore.network === 'mainnet' ? '#00ff9d' : '#00ffff'" />
								</svg>
								<Text size="14" weight="600" color="primary" style="text-transform: uppercase">
									{{ appStore.network }}
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

					<!-- Dashboard Link -->
					<router-link to="/dashboard" :class="$style.dashboardLink">
						<Icon name="arrow-top-right" size="16" color="primary" />
						<Text size="12" weight="700" color="primary">DASHBOARD</Text>
					</router-link>
				</Flex>
			</Flex>

			<Feed :txs="txs" />

			<TPM />
		</Flex>

		<Flex direction="column" justify="between"> </Flex>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;
	width: 100%;
	height: 100%;

	overflow: hidden;
	background: linear-gradient(135deg, rgba(0, 255, 157, 0.02) 0%, rgba(0, 0, 0, 0.95) 50%, rgba(255, 0, 255, 0.02) 100%);
	border: 1px solid rgba(0, 255, 157, 0.1);

	padding: 20px;
}

.atm_wrapper {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;

	pointer-events: none;

	display: flex;
	align-items: center;
	justify-content: center;
}

.atm {
	aspect-ratio: auto 1/1;
	height: 90%;

	transform-origin: center;
	transform: rotate(-52deg);

	border-radius: 50%;

	box-shadow: #00ff9d52 -0.8em 0 5.8em -1.5em inset;

	animation: fhl 20s ease infinite;
	animation-delay: 10s;
}
.atm {
	box-shadow: #00ff9de0 -2em 0 3em -0.5em inset, #000e1ad9 -3em 0 4em -1em inset, #00ff9d30 -60em 0 20em -40em inset;
	mix-blend-mode: color-dodge;
	color: #00ff9d9e;
	filter: blur(0.2em) drop-shadow(0.3em 0 4.5em #00ff9d);
	touch-action: none;
}

.atm::before,
.atm::after {
	content: "";
	display: block;
	height: 100%;
	border-radius: 50%;
	box-shadow: #00ff9d -1.5em 0 1em -1em inset;
	mix-blend-mode: color-dodge;
}
.atm::after {
	margin-top: -100%;
}

@keyframes fhl {
	0% {
		opacity: 1;
		transform: rotate(-52deg) scale(1);
	}

	15% {
		opacity: 0;
	}

	30% {
		opacity: 0;
		transform: rotate(-52deg) scale(2);
	}

	32% {
		opacity: 0;
	}

	40% {
		opacity: 1;
		transform: rotate(-52deg) scale(1);
	}

	100% {
		opacity: 1;
		transform: rotate(-52deg) scale(1);
	}
}

.controls {
	z-index: 1;
}

.dot {
	width: 6px;
	height: 6px;

	border-radius: 50%;
	background: rgba(0, 255, 157, 0.3);
	box-shadow: 0 0 8px rgba(0, 255, 157, 0.5);
}

.network_selector {
	width: fit-content;
	height: 38px;

	border-radius: 10px;
	border: 2px solid rgba(0, 255, 157, 0.2);
	background: rgba(0, 0, 0, 0.6);
	cursor: pointer;

	padding: 0 14px;

	transition: all 0.2s ease;

	&:hover {
		border: 2px solid rgba(0, 255, 157, 0.4);
		box-shadow: 0 0 15px rgba(0, 255, 157, 0.2);
	}

	&:active {
		border: 2px solid rgba(0, 255, 157, 0.6);
		background: rgba(0, 255, 157, 0.05);
	}
}

.dashboardLink {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: linear-gradient(135deg, rgba(0, 255, 157, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%);
	border: 1px solid rgba(0, 255, 157, 0.3);
	border-radius: 6px;
	transition: all 0.2s ease;
	text-decoration: none;
}

.dashboardLink:hover {
	background: linear-gradient(135deg, rgba(0, 255, 157, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
	box-shadow: 0 0 20px rgba(0, 255, 157, 0.3);
	transform: translateY(-1px);
}
</style>