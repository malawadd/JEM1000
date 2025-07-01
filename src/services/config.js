import { useAppStore } from "@/stores/app"

export const endpoints = {
	mainnet: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-mainnet/1.0.6/gn",
	base: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-base/1.0.8/gn",
	swell: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-swell/1.0.9/gn",
	sonic: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-sonic/1.0.3/gn",
	bob: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-bob/1.0.4/gn",
	berachain: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-berachain/1.0.3/gn",
	avalanche: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-avalanche/1.0.3/gn",
	arbitrum: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-arbitrum/1.0.2/gn",
	unichain: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-unichain/1.0.2/gn",
	ink: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-ink/1.0.2/gn",
	bsc: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-bsc/1.0.2/gn",
	hyperevm: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-hyperevm/1.0.1/gn",
	optimism: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-optimism/1.0.1/gn",
	gnosis: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-gnosis/1.0.1/gn",
	worldchain: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-worldchain/1.0.1/gn",
	tacturin: "https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-tacturin/1.0.1/gn"
}

export const useServerURL = () => {
	const appStore = useAppStore()
	return endpoints[appStore.network] || endpoints.mainnet
}

export const executeGraphQLQuery = async (query, variables = {}) => {
	const appStore = useAppStore()
	const endpoint = useServerURL()
	
	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query, variables })
		})
		
		const result = await response.json()
		if (result.errors) throw new Error(result.errors[0].message)
		return result.data
	} catch (error) {
		console.error('GraphQL Error:', error)
		throw error
	}
}