"use client";

import {
	ApolloClient,
	ApolloLink,
	ApolloProvider as ApolloProviderContainer,
	FetchResult,
	HttpLink,
	InMemoryCache,
	gql,
	split,
} from "@apollo/client";
import { Observable, getMainDefinition } from "@apollo/client/utilities";

import { GraphQLError } from "graphql/error/GraphQLError";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";

export function makeClient() {
	return new ApolloClient({
		link: new HttpLink({
			uri: "https://ap-south-1.cdn.hygraph.com/content/cmgqqrowy00cb07w62imm30go/master",
		}),
		cache: new InMemoryCache(),
	});
}
