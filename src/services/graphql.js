import { GraphQLClient } from 'graphql-request'
import { useEulerEndpoint } from './config.js'

export const createGraphQLClient = (chain) => {
	return new GraphQLClient(useEulerEndpoint(chain))
}

export const executeQuery = async (chain, query, variables = {}) => {
	try {
		const client = createGraphQLClient(chain)
		return await client.request(query, variables)
	} catch (error) {
		console.error(`GraphQL Error on ${chain}:`, error)
		throw error
	}
}