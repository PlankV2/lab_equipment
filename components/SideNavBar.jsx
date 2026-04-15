"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Home, ClipboardList, AlertTriangle, LogIn, User } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function SideNavBar() {
	const pathname = usePathname();
	const { isSignedIn } = useUser();

	console.log(pathname);
	return (
		<div className="p-4">
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="default" className="bg-black text-white">
						<Menu />
					</Button>
				</SheetTrigger>

				<SheetContent
					side="left"
					className="w-[300px] p-8 flex flex-col pr-[40px] overflow-visible"
				>
					<div className="flex flex-col gap-2 mb-8">
						<h1 className="font-bold text-[21px]">
							Inventory Manager
						</h1>
						<div className="flex">
							<span className="text-[15px] leading-4 text-gray-400">
								Hobby School Lab Equipment Inventory
							</span>
							<Image
								src="/Images/HobbyLogo.png"
								alt="logo"
								width={50}
								height={20}
							/>
						</div>
					</div>

					<nav className="flex flex-col gap-3">
						<Link
							href="/"
							className={`flex items-center gap-2 rounded-md cursor-pointer pl-3 py-2 ${
								pathname === "/" && "bg-black text-white "
							}`}
						>
							<Home size={18} /> Dashboard
						</Link>
						<Link
							href="/borrowedItems"
							className={`flex items-center gap-2 rounded-md cursor-pointer pl-3 py-2 ${
								pathname === "/borrowedItems" &&
								"bg-black text-white "
							}`}
						>
							<Home size={18} /> Borrowed Items
						</Link>

						<Link
							href="/inventory"
							className={`flex items-center gap-2 rounded-md cursor-pointer pl-3 py-2 ${
								pathname === "/inventory" &&
								"bg-black text-white "
							}`}
						>
							<ClipboardList size={18} /> Inventory
						</Link>

						<Link
							href="/users"
							className={`flex items-center gap-2 rounded-md cursor-pointer pl-3 py-2 ${
								pathname === "/users" &&
								"bg-black text-white "
							}`}
						>
							<User size={18} /> Users
						</Link>
						
						<Link
							href="/missing"
							className={`flex items-center gap-2 rounded-md cursor-pointer pl-3 py-2 ${
								pathname === "/missing" &&
								"bg-black text-white "
							}`}
						>
							<User size={18} /> Where is it?
						</Link>
					</nav>
				</SheetContent>
			</Sheet>
		</div>
	);
}
