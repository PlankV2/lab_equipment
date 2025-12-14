import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { HttpLink } from "@apollo/client";

export function makeClient() {
	return new ApolloClient({
		cache: new InMemoryCache(),
		link: new HttpLink({
			uri: "https://ap-south-1.cdn.hygraph.com/content/cmgqqrowy00cb07w62imm30go/master",
		}),
	});
}
