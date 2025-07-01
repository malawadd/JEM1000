/** Services */
import { useServerURL } from "@/services/config"



export const fetchTokens = async ({ attribute = 'holders', type = 'erc20', ps = 20, p = 1 } = {}) => {
	try {
		const url = new URL(`${useServerURL()}/tokens`)

		url.searchParams.append("attribute", attribute)
		url.searchParams.append("type", type)
		url.searchParams.append("ps", ps)
		url.searchParams.append("p", p)

		const data = await fetch(url.href, {
			headers: {
                'x-api-key': `FMhzdrfPUr5fK5JqtFV3Z50yP8sxWnUm5TPxtQJq`, 
            },
		}).then((r) => r.json())
		return data
	} catch (error) {
		console.error(error)
	}
}