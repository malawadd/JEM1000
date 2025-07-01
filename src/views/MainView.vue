<script setup>
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import ChainSelector from '@/components/ChainSelector.vue'
import AllVaultsWidget from '@/components/widgets/AllVaultsWidget.vue'
import LatestTransactionsWidget from '@/components/widgets/LatestTransactionsWidget.vue'
import LiquidationsWidget from '@/components/widgets/LiquidationsWidget.vue'
import VaultStatusWidget from '@/components/widgets/VaultStatusWidget.vue'
import EarnHarvestsWidget from '@/components/widgets/EarnHarvestsWidget.vue'
import SwapsWidget from '@/components/widgets/SwapsWidget.vue'
import WhaleBalancesWidget from '@/components/widgets/WhaleBalancesWidget.vue'
import NewVaultsWidget from '@/components/widgets/NewVaultsWidget.vue'
</script>

<template>
	<ErrorBoundary>
		<Flex direction="column" gap="20" :class="$style.wrapper">
			<!-- Header -->
			<Flex align="center" justify="between" :class="$style.header">
				<Flex align="center" gap="16">
					<Text size="24" weight="700" color="primary">Euler Finance v2</Text>
					<Text size="14" color="tertiary">Multi-Chain Dashboard</Text>
				</Flex>
				<ChainSelector />
			</Flex>

			<!-- Main Grid -->
			<div :class="$style.grid">
				<ErrorBoundary>
					<AllVaultsWidget />
				</ErrorBoundary>
				
				<ErrorBoundary>
					<LatestTransactionsWidget />
				</ErrorBoundary>
				
				<ErrorBoundary>
					<LiquidationsWidget />
				</ErrorBoundary>
				
				<ErrorBoundary>
					<VaultStatusWidget />
				</ErrorBoundary>
				
				<ErrorBoundary>
					<EarnHarvestsWidget />
				</ErrorBoundary>
				
				<ErrorBoundary>
					<SwapsWidget />
				</ErrorBoundary>
				
				<ErrorBoundary>
					<WhaleBalancesWidget />
				</ErrorBoundary>
				
				<ErrorBoundary>
					<NewVaultsWidget />
				</ErrorBoundary>
			</div>
		</Flex>
	</ErrorBoundary>
</template>

<style module>
.wrapper {
	min-height: 100vh;
	padding: 20px;
	background: var(--app-background);
}

.header {
	padding: 0 4px;
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
	gap: 20px;
	width: 100%;
}

@media (max-width: 768px) {
	.wrapper {
		padding: 12px;
	}
	
	.grid {
		grid-template-columns: 1fr;
		gap: 16px;
	}
}
</style>