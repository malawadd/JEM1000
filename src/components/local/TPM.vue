<script setup>
/** Vendor */
import { ref, onMounted } from "vue"


const tps = ref()

onMounted(async () => {
	
})
</script>

<template>
	<Flex direction="column" gap="12">


		<Text size="12" weight="600" color="tertiary">Refreshed every 30s</Text>
	</Flex>
</template>

<style module>
.bar {
	width: 4px;
	height: 20px;

	border-radius: 50px;
	background: var(--op-10);

	&.active {
		background: var(--txt-secondary);
		box-shadow: 0 0 10px rgba(255, 255, 255, 50%);
	}
}

.current {
	height: 20px;

	border-radius: 5px;
	background: var(--op-10);

	padding: 0 6px;
}
</style>
