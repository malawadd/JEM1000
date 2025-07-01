<script setup>
/** Components */
import GlobeWidget from "@/components/widgets/GlobeWidget.vue"
import ActiveRollupsWidget from "@/components/widgets/ActiveRollupsWidget.vue"
</script>

<template>
	<Flex gap="20" :class="$style.wrapper">
		<Flex direction="column" gap="20" :class="$style.left_column">
			<GlobeWidget />


		</Flex>

		<Flex direction="column" gap="20" :class="$style.right_column">
			<ActiveRollupsWidget />
			<!-- <StatsWidget /> -->
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
</style>
