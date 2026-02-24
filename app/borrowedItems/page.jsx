"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { GraphQLClient, gql } from "graphql-request";

/* ---------------- HYGRAPH CLIENT ---------------- */
const hygraph = new GraphQLClient(
	process.env.NEXT_PUBLIC_HYGRAPH_API_URL,
	{
		headers: {
			Authorization: `Bearer ${process.env.NEXT_PUBLIC_HYGRAPH_API_TOKEN}`,
		},
	}
);

/* ---------------- QUERIES ---------------- */
const GET_EQUIPMENTS = gql`
	query GetEquipments {
		equipments(first: 100) {
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
		draftBookings: bookings(
			stage: DRAFT
			orderBy: startTime_ASC
		) {
			id
			stage
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

		publishedBookings: bookings(
			stage: PUBLISHED
			orderBy: startTime_ASC
		) {
			id
			stage
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

/* ================================================= */
export default function Inventory() {
	const [inventory, setInventory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [equipmentsRes, bookingsRes] =
					await Promise.all([
						hygraph.request(GET_EQUIPMENTS),
						hygraph.request(GET_BOOKINGS),
					]);

				const now = new Date();

				/* ---------- MERGE BOOKINGS ---------- */
				const bookings = [
					...bookingsRes.draftBookings,
					...bookingsRes.publishedBookings,
				];

				const eqMap = {};

				/* ---------- INIT EQUIPMENT ---------- */
				equipmentsRes.equipments.forEach((eq) => {
					eqMap[eq.id] = {
						...eq,
						totalQuantity: eq.quantity ?? 0,
						borrowed: 0,
						logs: [],
						hasDraft: false,
					};
				});

				/* ---------- PROCESS BOOKINGS ---------- */
				bookings.forEach((b) => {
					const eqId = b.equipment?.id;
					if (!eqId || !eqMap[eqId]) return;

					const quantity = b.quantity ?? 0;
					const start = new Date(b.startTime);
					const end = new Date(b.endTime);

					// Count active now for borrowed quantity
					const isActiveNow =
						start <= now && now <= end &&
						b.stage === "PUBLISHED";

					if (isActiveNow) {
						eqMap[eqId].borrowed += quantity;
					}

					if (b.stage === "DRAFT") {
						eqMap[eqId].hasDraft = true;
					}

					eqMap[eqId].logs.push({
						...b,
						isActiveNow,
					});
				});

				/* ---------- CLEAN + SORT ---------- */
				const result = Object.values(eqMap)
					.filter((item) => item.logs.length > 0)
					.map((item) => ({
						...item,
						logs: item.logs.sort(
							(a, b) =>
								new Date(a.startTime) -
								new Date(b.startTime)
						),
					}));

				setInventory(result);
			} catch (err) {
				console.error("Failed to fetch inventory:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	/* ---------------- SEARCH ---------------- */
	const filteredInventory = useMemo(() => {
		if (!search.trim()) return inventory;

		const q = search.toLowerCase();

		return inventory.filter((item) =>
			item.name.toLowerCase().includes(q)
		);
	}, [inventory, search]);

	/* ---------------- CARD PRIORITY ---------------- */
	const getCardStyle = (item) => {
		const available = item.totalQuantity - item.borrowed;

		if (available < 0)
			return "bg-red-50 border-red-400";
		if (item.hasDraft)
			return "bg-yellow-50 border-yellow-400";
		if (item.logs.some((l) => l.stage === "PUBLISHED"))
			return "bg-green-50 border-green-400";
		return "border-black";
	};

	if (loading)
		return <div className="p-10">Loading inventory...</div>;

	return (
		<div className="flex flex-col w-full">
			{/* HEADER */}
			<div className="ml-[10%] mt-[5%]">
				<span className="text-[40px]">Inventory</span>
				<p className="text-[12px]">
					View and search lab equipments
				</p>
			</div>

			{/* SEARCH */}
			<div className="ml-[10%] mt-[10px] w-[50%]">
				<input
					type="text"
					value={search}
					onChange={(e) =>
						setSearch(e.target.value)
					}
					placeholder="Search items..."
					className="border border-black rounded-lg px-3 py-1 w-full"
				/>
			</div>

			{/* INVENTORY LIST */}
			{filteredInventory.map((item) => {
				const available =
					item.totalQuantity - item.borrowed;

				return (
					<div
						key={item.id}
						className={`mt-[30px] mx-[10%] flex gap-[20px] px-[20px] py-[10px] border ${getCardStyle(
							item
						)}`}
					>
						{/* EQUIPMENT INFO */}
						<div className="flex items-center w-[260px]">
							<Image
								width={80}
								height={80}
								src={
									item.image?.url ||
									"/Images/t_beaker.png"
								}
								alt={item.name}
								className="mr-[10px]"
							/>
							<span>{item.name}</span>
						</div>

						{/* STATS + LOGS */}
						<div className="flex gap-[50px] flex-1">
							{/* STATS */}
							<div>
								<p>Total: {item.totalQuantity}</p>
								<p>Borrowed: {item.borrowed}</p>
								<p>Available: {available}</p>
							</div>

							{/* LOGS */}
							<div className="flex flex-col max-h-[150px] overflow-y-auto text-sm">
								{item.logs.map((log) => {
									const start = new Date(
										log.startTime
									);
									const end = new Date(
										log.endTime
									);

									const logNow =
										log.isActiveNow;

									const logStyle = logNow
										? "bg-green-100 font-semibold px-1 rounded"
										: log.stage === "DRAFT"
										? "bg-yellow-100 px-1 rounded"
										: "px-1";

									return (
										<span
											key={log.id}
											className={`${logStyle} text-gray-700 mb-[2px]`}
										>
											{start.toLocaleDateString()} →{" "}
											{end.toLocaleDateString()} —{" "}
											{log.profile?.name ||
												log.profile?.email}{" "}
											borrowed {log.quantity ?? 0}
										</span>
									);
								})}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}