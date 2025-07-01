/** Services */
import { useServerURL } from "@/services/config"

// export const fetchThxByHeight = async ({ limit, offset, sort, height, from, status, type, excluded_types }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/tx`)

// 		url.searchParams.append("height", height)
// 		if (from) url.searchParams.append("from", from)
// 		if (limit) url.searchParams.append("limit", limit)
// 		if (sort) url.searchParams.append("sort", sort)
// 		if (offset) url.searchParams.append("offset", offset)
// 		if (status) url.searchParams.append("status", status)
// 		if (type) url.searchParams.append("msg_type", type)
// 		if (excluded_types) url.searchParams.append("excluded_msg_type", excluded_types)

// 		const data = await fetch(url.href).then((r) => r.json())
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

export const fetchThxByHeight = async ({ block, to, type, rejected = false, ps = 10, p = 1 }) => {
    try {
        const url = new URL(`${useServerURL()}/txns`)

        // Add query parameters
        if (block) url.searchParams.append('block', block)
        if (to) url.searchParams.append('to', to)
        if (type) url.searchParams.append('type', type)
        url.searchParams.append('rejected', rejected)
        url.searchParams.append('ps', ps)
        url.searchParams.append('p', p)
        
        // Fetch data from the API
        const response = await fetch(url.href, {
            headers: {
                'x-api-key': `FMhzdrfPUr5fK5JqtFV3Z50yP8sxWnUm5TPxtQJq`, // Add your token here
            },
        })

        const data = await fetch(url.href).then((r) => r.json())
		return data
       
    
		console.log(data)
        return response
    } catch (error) {
        console.error(error)
        return null
    }
}
