import { ref } from "vue"
import { defineStore } from "pinia"

export const useAppStore = defineStore("app", () => {
	// Initialize network from localStorage or default to mainnet
	const getInitialNetwork = () => {
		try {
			const saved = localStorage.getItem('euler-dashboard-network')
			if (saved) {
				// Validate that the saved network is still valid
				const validNetworks = [
					"mainnet", "base", "swell", "sonic", "bob", "berachain", 
					"avalanche", "arbitrum", "unichain", "ink", "bsc", 
					"hyperevm", "optimism", "gnosis", "worldchain", "tacturin"
				]
				if (validNetworks.includes(saved)) {
					return saved
				}
			}
		} catch (error) {
			console.warn('Failed to load network from localStorage:', error)
		}
		return "mainnet"
	}

	const network = ref(getInitialNetwork())
	const head = ref()

	const networks = [
		{ key: "mainnet", name: "Mainnet" },
		{ key: "base", name: "Base" },
		{ key: "swell", name: "Swell" },
		{ key: "sonic", name: "Sonic" },
		{ key: "bob", name: "BOB" },
		{ key: "berachain", name: "Berachain" },
		{ key: "avalanche", name: "Avalanche" },
		{ key: "arbitrum", name: "Arbitrum" },
		{ key: "unichain", name: "Unichain" },
		{ key: "ink", name: "Ink" },
		{ key: "bsc", name: "BSC" },
		{ key: "hyperevm", name: "HyperEVM" },
		{ key: "optimism", name: "Optimism" },
		{ key: "gnosis", name: "Gnosis" },
		{ key: "worldchain", name: "Worldchain" },
		{ key: "tacturin", name: "TAC Turin" }
	]

	// Watch for network changes and persist to localStorage
	const setNetwork = (newNetwork) => {
		network.value = newNetwork
		try {
			localStorage.setItem('euler-dashboard-network', newNetwork)
		} catch (error) {
			console.warn('Failed to save network to localStorage:', error)
		}
	}
	return { network, head, networks, setNetwork }
})