<script setup>
/** Vendor */
import { ref, watch, onMounted, onBeforeUnmount } from "vue"
import { DateTime } from "luxon"

/** Utils */
import { formatBytes, getCeleniumURL } from "@/services/general"

/** API */
import { fetchTokens } from "@/services/api/token"

/** Store */
import { useAppStore } from "@/stores/app"
const appStore = useAppStore()

const tokens = ref([])
const total = ref(0)
const totalHolders = ref(0)

const availableSize = ref(0)

const tokensEl = ref()

const getData = async () => {
	const rawTokens = await fetchTokens({ attribute: 'holders', type: 'erc20', ps: 25, p: 1 })
	tokens.value = rawTokens.items || []

	total.value = tokens.value.length
	totalHolders.value = tokens.value.reduce((acc, curr) => acc + parseInt(curr.holders), 0)
}

onMounted(async () => {
	availableSize.value = Math.floor((tokensEl.value.wrapper.getBoundingClientRect().height - 32) / 68)

	getData()
	setInterval(() => {
		getData()
	}, 60_000 * 5)

	window.addEventListener("resize", onResize)
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", onResize)
})

watch(
	() => appStore.network,
	() => {
		getData()
	},
)

const onResize = () => {
	availableSize.value = Math.floor((tokensEl.value.wrapper.getBoundingClientRect().height - 32) / 72)
}
</script>

<template>
	<Flex direction="column" gap="24" :class="$style.wrapper">
		<Text size="16" weight="600" color="primary">Top Tokens</Text>

		<Flex align="center" gap="40">
			<Flex direction="column" gap="8">
				<Text size="24" weight="500" color="primary" mono>{{ formatBytes(totalHolders) }}</Text>
				<Text size="14" weight="500" color="tertiary">Total Holders</Text>
			</Flex>


		</Flex>

		<Flex ref="tokensEl" direction="column" gap="8" :class="$style.tokens">
			<a v-for="(token, idx) in tokens.slice(0, availableSize)" :key="token.address"
				:href="`${getCeleniumURL(appStore.network)}/token/${token.address}`" target="_blank">
				<Flex align="center" justify="between" :class="$style.token">
					<Flex align="center" gap="12">
						<Text size="16" weight="500" color="tertiary" :class="$style.counter">{{ idx + 1 }}</Text>

						<Flex direction="column" gap="6">
							<Text size="14" weight="600" color="primary"> {{ token.name }} ({{ token.symbol }}) </Text>
							<Text size="13" weight="500" color="tertiary">
								{{ DateTime.fromISO(token.transfers).setLocale("en").toRelative() }}
							</Text>
						</Flex>
					</Flex>

					<Text size="14" weight="600" color="primary">{{ token.holders }}</Text>
				</Flex>
			</a>

			<a v-if="tokens.length > 0" href="https://voyager.online/tokens" target="_blank">
				<Flex justify="center" align="center" gap="6" :class="$style.btn">
					<Text size="13" weight="600" color="secondary">View all on voyager Explorer</Text>
					<Icon name="arrow-top-right" size="14" color="secondary" />
				</Flex>
			</a>
		</Flex>

		<Text size="12" weight="500" color="support">Refetch every 5 minutes</Text>
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;

	background: var(--card-background);

	padding: 20px;
}

.rollups {
	flex: 1;
}

.rollup {
	min-height: 60px;

	box-shadow: 0 0 0 2px var(--op-5);
	border-radius: 8px;

	padding: 0 16px;

	& img {
		width: 40px;
		height: 40px;

		border-radius: 50%;
		background: var(--card-background);
	}

	& .counter {
		min-width: 20px;
	}
}

.btn {
	min-height: 32px;

	background: var(--card-background);
	border-radius: 8px;
	cursor: pointer;

	& span {
		transition: all 0.2s ease;
	}

	&:hover {
		box-shadow: inset 0 0 0 1px var(--op-5);

		& span {
			color: var(--txt-primary);
		}
	}
}
</style>@/services/api/token
