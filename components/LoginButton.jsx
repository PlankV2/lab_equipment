"use client";

import React from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

const LoginButton = () => {
	const { isSignedIn } = useUser();

	return (
		<div className="absolute top-[30px] right-[30px] z-50">
			{!isSignedIn ? (
				<SignInButton mode="modal">
					<button className="flex items-center gap-2 bg-black text-white rounded-md py-2 px-4">
						<LogIn size={18} /> Login
					</button>
				</SignInButton>
			) : (
				<UserButton
					afterSignOutUrl="/"
					userProfileMode="modal"
					appearance={{
						variables: {
							avatarSize: "48px",
						},
					}}
				/>
			)}
		</div>
	);
};

export default LoginButton;
