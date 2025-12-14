"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { FlaskConical } from "lucide-react";
import Link from "next/link";

const BorrowButton = () => {
	const pathname = usePathname();

	return (
		<>
			{pathname === "/borrow" && (
				<div className="fixed right-[250px] bottom-[30px]">
					<div className="bg-black text-white px-10 py-3 rounded-lg">
						<div className="flex gap-2 items-center">
							<span>Confirm</span>
						</div>
					</div>
				</div>
			)}
			{pathname !== "/borrow" && (
				<Link href="/borrow">
					<div className="fixed right-[100px] bottom-[30px]">
						<div className="bg-black text-white px-10 py-3 rounded-lg">
							<div className="flex gap-2 items-center">
								<FlaskConical size={20} />
								<span>Borrow Item</span>
							</div>
						</div>
					</div>
				</Link>
			)}
		</>
	);
};

export default BorrowButton;
