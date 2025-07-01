<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { CHAIN_NAMES } from '@/services/config'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'

const appStore = useAppStore()

const currentChainName = computed(() => CHAIN_NAMES[appStore.selectedChain])
const chainOptions = computed(() => Object.entries(CHAIN_NAMES))

const selectChain = (chainKey) => {
	appStore.setChain(chainKey)
}
</script>

<template>
	<Dropdown>
		<Flex align="center" gap="8" :class="$style.selector">
			<div :class="$style.indicator" />
			<Text size="14" weight="600" color="primary">{{ currentChainName }}</Text>
			<Icon name="chevron" size="12" color="secondary" />
		</Flex>

		<template #popup>
			<DropdownItem 
				v-for="[key, name] in chainOptions" 
				:key="key"
				@click="selectChain(key)"
			>
				<Flex align="center" gap="8">
					<Icon 
						:name="appStore.selectedChain === key ? 'check' : ''" 
						size="14" 
						color="secondary" 
					/>
					{{ name }}
				</Flex>
			</DropdownItem>
		</template>
	</Dropdown>
</template>

<style module>
.selector {
	height: 36px;
	padding: 0 12px;
	border: 2px solid var(--op-10);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.selector:hover {
	border-color: var(--op-20);
	background: var(--op-5);
}

.indicator {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--green);
}
</style>