<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)
const hasError = ref(false)

onErrorCaptured((err) => {
	error.value = err
	hasError.value = true
	console.error('Error caught by boundary:', err)
	return false
})

const retry = () => {
	error.value = null
	hasError.value = false
}
</script>

<template>
	<div v-if="hasError" :class="$style.error">
		<Flex direction="column" align="center" gap="16">
			<Icon name="warning" size="48" color="red" />
			<Text size="18" weight="600" color="primary">Something went wrong</Text>
			<Text size="14" color="secondary" align="center">
				{{ error?.message || 'An unexpected error occurred' }}
			</Text>
			<button @click="retry" :class="$style.retryBtn">
				Try Again
			</button>
		</Flex>
	</div>
	<slot v-else />
</template>

<style module>
.error {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200px;
	padding: 40px;
	background: var(--card-background);
	border-radius: 12px;
}

.retryBtn {
	padding: 8px 16px;
	background: var(--blue);
	color: white;
	border-radius: 6px;
	font-weight: 600;
	transition: opacity 0.2s;
}

.retryBtn:hover {
	opacity: 0.8;
}
</style>