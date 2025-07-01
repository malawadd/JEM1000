import { ref } from "vue"
import { defineStore } from "pinia"

export const useAppStore = defineStore("app", () => {
	const network = ref("mainnet")
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

	return { network, head, networks }
})