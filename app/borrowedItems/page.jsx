"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { GraphQLClient, gql } from "graphql-request";

const hygraph = new GraphQLClient(process.env.NEXT_PUBLIC_HYGRAPH_API_URL, {
	headers: {
		Authorization: `Bearer ${process.env.NEXT_PUBLIC_HYGRAPH_API_TOKEN}`,
	},
});

const GET_BOOKINGS = gql`
	query GetBookings {
		bookings(orderBy: startTime_DESC) {
			id
			quantity
			startTime
			endTime
			profile {
				name
				email
			}
			equipment {
				id
				name
				quantity
				image {
					url
				}
			}
		}
	}
`;

const Inventory = () => {
	const [inventory, setInventory] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchBookings = async () => {
			try {
				const data = await hygraph.request(GET_BOOKINGS);
				const now = new Date().getTime(); // current time in milliseconds

				const map = {};

				data.bookings.forEach((b) => {
					const eq = b.equipment;
					if (!eq) return;

					if (!map[eq.id]) {
						map[eq.id] = {
							...eq,
							activeBorrowed: 0,
							logs: [],
						};
					}

					const quantity = b.quantity ?? 0;
					const start = new Date(b.startTime).getTime();
					const end = new Date(b.endTime).getTime();

					// Count ACTIVE borrowings (current time is within start/end)
					if (start <= now && now <= end) {
						map[eq.id].activeBorrowed += quantity;
					}

					map[eq.id].logs.push(b);
				});

				setInventory(Object.values(map));
			} catch (err) {
				console.error("Failed to fetch inventory:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchBookings();
	}, []);

	if (loading) {
		return <div className="p-10">Loading inventory...</div>;
	}

	return (
		<div className="flex flex-col w-full">
			<div className="ml-[10%] mt-[5%]">
				<span className="text-[40px]">Inventory</span>
				<p className="text-[12px]">Currently borrowed lab equipments</p>
			</div>

			{inventory.map((item) => {
				const total = item.quantity ?? 0;
				const borrowed = item.activeBorrowed;
				const available = total - borrowed;

				return (
					<div
						key={item.id}
						className="border border-black mt-[30px] mx-[10%] flex gap-[20px] px-[20px] py-[10px]"
					>
						{/* Equipment info */}
						<div className="flex items-center w-[260px]">
							<Image
								width={80}
								height={80}
								src={item.image?.url || "/Images/t_beaker.png"}
								className="object-cover mr-[10px]"
								alt={item.name}
							/>
							<span>{item.name}</span>
						</div>

						{/* Stats */}
						<div className="flex gap-[50px] flex-1">
							<div className="flex">
								<div className="flex flex-col">
									<span>Total</span>
									<span>Currently Borrowed</span>
									<span>Available</span>
								</div>
								<div className="flex flex-col ml-[10px]">
									<span>{total}</span>
									<span>{borrowed}</span>
									<span>{available}</span>
								</div>
							</div>

							{/* Logs */}
							<div className="flex flex-col">
								<span>Log</span>
								<div className="flex flex-col max-h-[90px] overflow-y-auto">
									{item.logs.map((log) => (
										<span
											key={log.id}
											className="text-gray-400 text-sm"
										>
											{new Date(
												log.startTime
											).toLocaleDateString()}{" "}
											→{" "}
											{new Date(
												log.endTime
											).toLocaleDateString()}{" "}
											—{" "}
											{log.profile?.name ||
												log.profile?.email}{" "}
											borrowed {log.quantity ?? 0}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default Inventory;
