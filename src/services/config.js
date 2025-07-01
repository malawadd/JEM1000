import { useAppStore } from "@/stores/app"

export const endpoints = {
	api: {
		mainnet: "https://api.voyager.online/beta",
		sepolia: " https://sepolia-api.voyager.online/beta",

	},
	wss: {
		mainnet: "",
		sepolia: "",

	},
}

export const useServerURL = () => {
	const appStore = useAppStore()

	switch (appStore.network) {
		case "mainnet":
			return endpoints.api.mainnet

		case "sepolia":
			return endpoints.api.sepolia

		default:
			return endpoints.api.mainnet
	}
}

export const useSocketURL = () => {
	const appStore = useAppStore()

	switch (appStore.network) {
		case "mainnet":
			return endpoints.wss.mainnet

		case "sepolia":
			return endpoints.wss.sepolia

		default:
			return endpoints.wss.mainnet
	}
}
