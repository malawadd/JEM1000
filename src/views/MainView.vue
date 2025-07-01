<script setup>
/** Components */
import GlobeWidget from "@/components/widgets/GlobeWidget.vue"
import CelestiaPriceWidget from "@/components/widgets/CelestiaPriceWidget.vue"
import BlobsFlowWidget from "@/components/widgets/BlobsFlowWidget.vue"
import GasPriceWidget from "@/components/widgets/GasPriceWidget.vue"
import ActiveRollupsWidget from "@/components/widgets/ActiveRollupsWidget.vue"
import StatsWidget from "@/components/widgets/StatsWidget.vue"
</script>

<template>
	<Flex gap="20" :class="$style.wrapper">
		<Flex direction="column" gap="20" :class="$style.left_column">
			<GlobeWidget />

			<Flex gap="20" :class="$style.bottom">
				<CelestiaPriceWidget />
				<BlobsFlowWidget />
				<GasPriceWidget />
			</Flex>
		</Flex>

		<Flex direction="column" gap="20" :class="$style.right_column">
			<ActiveRollupsWidget />
			<StatsWidget />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;
	height: 100%;

	padding: 20px;
}

.left_column {
	width: 100%;

	& .bottom {
		min-height: 220px;
	}
}

.right_column {
	min-width: 400px;
	height: 100%;
}

@media (max-width: 2000px) {
	.bottom {
		& > div {
			flex: 1;
			min-width: initial;
			width: initial;
		}
	}
}

@media (max-width: 1500px) {
	.wrapper {
		flex-direction: column;
	}
}

@media (max-width: 1000px) {
	.bottom {
		flex-direction: column;
	}

	.bottom {
		& > div {
			gap: 16px;
		}
	}

	.left_column {
		& .bottom {
			min-height: initial;
		}
	}
}

@media (max-width: 700px) {
	.wrapper {
		padding: 12px;
	}
}
</style>
