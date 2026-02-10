"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { SquarePlus, SquareMinus, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { hygraph } from "@/lib/hygraph";
import { gql } from "graphql-request";

/* ---------------- GraphQL ---------------- */

const GET_EQUIPMENTS = gql`
	query {
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
	query {
		bookings {
			id
			quantity
			startTime
			endTime
			equipment {
				id
			}
		}
	}
`;

export default function Borrow() {
	const { user } = useUser();

	const [equipments, setEquipments] = useState([]);
	const [bookings, setBookings] = useState([]);
	const [availableItems, setAvailableItems] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]);

	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	const [search, setSearch] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const [loading, setLoading] = useState(false);
	const [showTooltip, setShowTooltip] = useState(false);

	const timelineSelected = startDate && endDate;

	/* ---------------- Fetch Data ---------------- */

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const eq = await hygraph.request(GET_EQUIPMENTS);
				const bk = await hygraph.request(GET_BOOKINGS);

				setEquipments(eq.equipments);
				setBookings(bk.bookings);
			} catch (err) {
				console.error("Fetch error:", err);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	/* ---------------- Availability ---------------- */

	useEffect(() => {
		const borrowedMap = {};

		if (timelineSelected) {
			bookings.forEach((b) => {
				const bs = new Date(b.startTime);
				const be = new Date(b.endTime);

				if (startDate <= be && endDate >= bs) {
					const id = b.equipment?.id;
					if (id) {
						borrowedMap[id] =
							(borrowedMap[id] || 0) + (b.quantity ?? 0);
					}
				}
			});
		}

		const items = equipments.map((e) => ({
			id: e.id,
			name: e.name,
			image: e.image?.url || "/Images/t_beaker.png",
			totalQuantity: e.quantity ?? 0,
			availableQuantity:
				timelineSelected
					? (e.quantity ?? 0) - (borrowedMap[e.id] || 0)
					: e.quantity ?? 0,
		}));

		setAvailableItems(items);
	}, [timelineSelected, startDate, endDate, equipments, bookings]);

	/* ---------------- Search ---------------- */

	const filteredItems = useMemo(() => {
		if (!search) return availableItems;
		return availableItems.filter((i) =>
			i.name.toLowerCase().includes(search.toLowerCase())
		);
	}, [search, availableItems]);

	/* ---------------- Selection ---------------- */

	const addItem = (item) => {
		if (!timelineSelected) {
			setShowTooltip(true);
			setTimeout(() => setShowTooltip(false), 2000);
			return;
		}
		if (item.availableQuantity <= 0) return;

		setSelectedItems((prev) => {
			const exists = prev.find((s) => s.item.id === item.id);
			if (exists) {
				if (exists.quantity < item.availableQuantity) {
					return prev.map((s) =>
						s.item.id === item.id
							? { ...s, quantity: s.quantity + 1 }
							: s
					);
				}
				return prev;
			}
			return [...prev, { item, quantity: 1 }];
		});
	};

	const adjustQuantity = (id, delta) => {
		setSelectedItems((prev) =>
			prev.map((s) =>
				s.item.id === id
					? {
							...s,
							quantity: Math.min(
								Math.max(s.quantity + delta, 1),
								s.item.availableQuantity
							),
					  }
					: s
			)
		);
	};

	const removeItem = (id) => {
		setSelectedItems((prev) => prev.filter((s) => s.item.id !== id));
	};

	/* ---------------- Submit ---------------- */

	const submitBooking = async () => {
		setLoading(true);
		try {
			const bookingData = selectedItems.map((s) => ({
				equipmentId: s.item.id,
				quantity: s.quantity,
				startTime: startDate.toISOString(),
				endTime: endDate.toISOString(),
				userEmail: user.emailAddresses[0].emailAddress,
			}));

			await fetch("/api/book-equipment", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ bookingData }),
			});

			setSelectedItems([]);
			setShowConfirmModal(false);
		} catch (err) {
			console.error("Booking failed:", err);
		} finally {
			setLoading(false);
		}
	};

	/* ---------------- UI ---------------- */

	return (
		<div className="flex flex-col w-full h-full relative">
			{/* Header */}
			<div className="ml-[10%] mt-[5%]">
				<span className="text-[40px]">Borrow Equipments</span>
			</div>

			{/* Date Pickers */}
			<div className="flex gap-6 ml-[10%] mt-[20px]">
				<DatePicker
					selected={startDate}
					onChange={setStartDate}
					showTimeSelect
					placeholderText="Select Start"
					dateFormat="Pp"
				/>

				<DatePicker
					selected={endDate}
					onChange={setEndDate}
					minDate={startDate}
					showTimeSelect
					placeholderText="Select End"
					dateFormat="Pp"
				/>
			</div>

			{/* Search */}
			<div className="ml-[10%] mt-[15px] w-[40%]">
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search..."
					className="border px-2 py-1 rounded w-full"
				/>
			</div>

			{/* Equipment Grid */}
			<div className="grid grid-cols-3 gap-4 px-[10%] mt-[20px] mb-[300px] relative">
				{filteredItems.map((item) => {
					const unavailable =
						!timelineSelected || item.availableQuantity <= 0;

					return (
						<div
							key={item.id}
							className={`rounded-xl overflow-hidden ${
								unavailable
									? "opacity-40 grayscale bg-gray-200"
									: "bg-gray-100"
							}`}
						>
							<div className="relative w-full h-[260px]">
								<Image
									src={item.image}
									fill
									alt={item.name}
									className="object-cover"
								/>
							</div>

							<div className="p-3">
								<span>{item.name}</span>
								<div className="bg-amber-400 w-fit px-3 rounded mt-1">
									{item.availableQuantity} available
								</div>

								<button
									onClick={() => addItem(item)}
									disabled={unavailable}
									className={`mt-3 w-full py-2 rounded text-white ${
										unavailable
											? "bg-gray-400 cursor-not-allowed"
											: "bg-black cursor-pointer"
									}`}
								>
									Add Item
								</button>
							</div>
						</div>
					);
				})}

				{/* Timeline Tooltip */}
				{showTooltip && (
					<div className="absolute inset-0 flex items-center justify-center z-10">
						<span className="text-white text-lg px-4 py-2 bg-red-600 rounded">
							Please select Start & End dates first!
						</span>
					</div>
				)}
			</div>

			{/* Selected Panel */}
			<div className="fixed bottom-0 right-[10%] left-[15%] bg-gray-200 p-4 rounded-lg border-4 border-gray-300">
				{selectedItems.map((s) => (
					<div key={s.item.id} className="flex justify-between mb-2">
						<span>{s.item.name}</span>

						<div className="flex gap-2 items-center">
							<button onClick={() => adjustQuantity(s.item.id, -1)} className="cursor-pointer">
								<SquareMinus />
							</button>

							<span>{s.quantity}</span>

							<button onClick={() => adjustQuantity(s.item.id, 1)} className="cursor-pointer">
								<SquarePlus />
							</button>

							<button
								onClick={() => removeItem(s.item.id)}
								className="text-red-500 ml-2 cursor-pointer"
							>
								<X />
							</button>
						</div>
					</div>
				))}

				{selectedItems.length > 0 && (
					<button
						onClick={() => setShowConfirmModal(true)}
						className="bg-green-600 text-white px-6 py-2 rounded-lg mt-2 cursor-pointer"
					>
						Submit Booking
					</button>
				)}
			</div>

			{/* Confirmation Modal */}
			{showConfirmModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-xl w-[400px]">
						<h2 className="text-xl mb-4 font-semibold">
							Confirm Booking
						</h2>

						<p className="mb-2">
							<b>Start:</b> {startDate?.toLocaleString()}
						</p>
						<p className="mb-4">
							<b>End:</b> {endDate?.toLocaleString()}
						</p>

						<div className="mb-4">
							{selectedItems.map((s) => (
								<div key={s.item.id}>
									{s.item.name} × {s.quantity}
								</div>
							))}
						</div>

						<div className="flex justify-end gap-3">
							<button
								onClick={() => setShowConfirmModal(false)}
								className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
							>
								Cancel
							</button>

							<button
								onClick={submitBooking}
								className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Loading Spinner (Non-Intrusive) */}
			{loading && (
				<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
					<div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
				</div>
			)}
		</div>
	);
}
