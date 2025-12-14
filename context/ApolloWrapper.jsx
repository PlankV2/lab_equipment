"use client";

import { ApolloNextAppProvider } from "@apollo/experimental-nextjs-app-support";
import { makeClient } from "./ApolloContext.jsx";

export default function ApolloWrapper({ children }) {
	return (
		<ApolloNextAppProvider makeClient={makeClient}>
			{children}
		</ApolloNextAppProvider>
	);
}
