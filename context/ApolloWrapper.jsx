"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { makeClient } from "@/context/ApolloContext";

export default function ApolloWrapper({ children }) {
	return (
		<ApolloNextAppProvider makeClient={makeClient}>
			{children}
		</ApolloNextAppProvider>
	);
}
