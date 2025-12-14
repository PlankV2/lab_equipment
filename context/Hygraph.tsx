import { GraphQLClient } from "graphql-request";

export const hygraph = new GraphQLClient(process.env.HYGRAPH_ENDPOINT!, {
	headers: {
		Authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
	},
});
