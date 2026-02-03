"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { GraphQLClient, gql } from "graphql-request";

const hygraph = new GraphQLClient(process.env.NEXT_PUBLIC_HYGRAPH_API_URL, {
	headers: {
		Authorization: `Bearer ${process.env.NEXT_PUBLIC_HYGRAPH_API_TOKEN}`,
	},
});

const GET_EQUIPMENTS = gql`
	query GetEquipments {
		equipments {
			id
			name
			quantity
			image {
				url
			}
		}
	}
`;

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
			}
		}
	}
`;

const Inventory = () => {
	const [inventory, setInventory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [equipmentsRes, bookingsRes] = await Promise.all([
					hygraph.request(GET_EQUIPMENTS),
					hygraph.request(GET_BOOKINGS),
				]);

				const now = new Date();

				const eqMap = {};
				equipmentsRes.equipments.forEach((eq) => {
					eqMap[eq.id] = {
						...eq,
						totalQuantity: eq.quantity ?? 0,
						borrowed: 0,
						logs: [],
					};
				});

				bookingsRes.bookings.forEach((b) => {
					const eqId = b.equipment?.id;
					if (!eqId || !eqMap[eqId]) return;

					const start = new Date(b.startTime);
					const end = new Date(b.endTime);

					if (start <= now && now <= end) {
						eqMap[eqId].borrowed += b.quantity ?? 0;
					}

					eqMap[eqId].logs.push(b);
				});

				setInventory(Object.values(eqMap));
			} catch (err) {
				console.error("Failed to fetch inventory:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	/* ---------------- SEARCH + SORT LOGIC ---------------- */

	const filteredInventory = useMemo(() => {
		if (!search.trim()) return inventory;

		const query = search.toLowerCase();

		const scoreItem = (name) => {
			const lower = name.toLowerCase();

			if (lower === query) return 3; // exact match
			if (lower.startsWith(query)) return 2; // starts with
			if (lower.includes(query)) return 1; // contains
			return 0;
		};

		return inventory
			.map((item) => ({
				item,
				score: scoreItem(item.name),
			}))
			.filter((x) => x.score > 0)
			.sort((a, b) => b.score - a.score)
			.map((x) => x.item);
	}, [inventory, search]);

	if (loading) return <div className="p-10">Loading inventory...</div>;

	return (
		<div className="flex flex-col w-full">
			<div className="ml-[10%] mt-[5%]">
				<span className="text-[40px]">Inventory</span>
				<p className="text-[12px]">View and search lab equipments</p>
			</div>

			{/* Search + Category */}
			<div className="flex w-full ml-[10%] mt-[5px] pr-[20%] gap-5">
				{/* SEARCH BAR */}
				<div className="flex w-[50%] h-[30px] border border-black rounded-lg items-center px-2">
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search Items..."
						className="w-full outline-none text-[15px]"
					/>
				</div>
			</div>

			{/* INVENTORY LIST */}
			{filteredInventory.map((item) => {
				const available = item.totalQuantity - item.borrowed;

				return (
					<div
						key={item.id}
						className="border border-black mt-[30px] mx-[10%] flex gap-[20px] px-[20px] py-[10px]"
					>
						{/* Equipment Info */}
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
									<span>Borrowed</span>
									<span>Available</span>
								</div>
								<div className="flex flex-col ml-[10px]">
									<span>{item.totalQuantity}</span>
									<span>{item.borrowed}</span>
									<span>{available}</span>
								</div>
							</div>

							{/* Logs */}
							<div className="flex flex-col">
								<span>Log</span>
								<div className="flex flex-col max-h-[120px] overflow-y-auto">
									{item.logs.map((log) => (
										<span
											key={log.id}
											className="text-gray-400 text-sm"
										>
											{new Date(
												log.startTime,
											).toLocaleDateString()}{" "}
											→{" "}
											{new Date(
												log.endTime,
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
