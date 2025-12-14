import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// Client for fetching data (CDN endpoint)
export const cdnClient = new ApolloClient({
	link: new HttpLink({
		uri: process.env.HYGRAPH_ENDPOINT,
	}),
	cache: new InMemoryCache(),
});

// Client for mutations (Management API)
export const managementClient = new ApolloClient({
	link: new HttpLink({
		uri: process.env.HYGRAPH_MANAGEMENT_ENDPOINT,
		headers: {
			Authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
		},
	}),
	cache: new InMemoryCache(),
});
