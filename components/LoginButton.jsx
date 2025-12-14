"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

const LoginButton = () => {
	const { isSignedIn } = useUser();

	return (
		<div className="relative z-100">
			<div className="absolute top-[30px] right-[30px]">
				<div className="absolute top-[30px] right-[30px] z-50">
					{!isSignedIn ? (
						<SignInButton mode="modal">
							<button className="flex items-center justify-center gap-2 bg-black text-white rounded-md py-2 px-4 cursor-pointer">
								<LogIn size={18} /> Login
							</button>
						</SignInButton>
					) : (
						<UserButton
							afterSignOutUrl="/"
							userProfileMode="modal"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default LoginButton;
