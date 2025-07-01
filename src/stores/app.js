import { ref } from "vue"
import { defineStore } from "pinia"

export const useAppStore = defineStore("app", () => {
	const selectedChain = ref("mainnet")
	const globalTVL = ref(0)
	const isLoading = ref(false)
	const error = ref(null)

	const setChain = (chain) => {
		selectedChain.value = chain
	}

	const setError = (err) => {
		error.value = err
	}

	const clearError = () => {
		error.value = null
	}

	return { 
		selectedChain, 
		globalTVL, 
		isLoading, 
		error,
		setChain,
		setError,
		clearError
	}
})