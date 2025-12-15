"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
	FlaskConical,
	Database,
	Diff,
	Scale,
	SquarePlus,
	SquareMinus,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { hygraph } from "@/lib/hygraph";
import { gql } from "graphql-request";

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
	query GetActiveBookings {
		bookings(orderBy: startTime_DESC) {
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

const Borrow = () => {
	const [availableItems, setAvailableItems] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]);
	const [showTimepicker, setShowTimepicker] = useState(false);
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(new Date());

	const { user } = useUser();

	useEffect(() => {
		async function fetchData() {
			try {
				// Fetch equipments
				const equipmentsRes = await hygraph.request(GET_EQUIPMENTS);

				// Fetch bookings
				const bookingsRes = await hygraph.request(GET_BOOKINGS);
				const now = new Date();

				// Calculate currently borrowed quantities per equipment
				const borrowedMap = {};
				bookingsRes.bookings.forEach((b) => {
					const start = new Date(b.startTime);
					const end = new Date(b.endTime);
					if (start <= now && now <= end) {
						const eqId = b.equipment?.id;
						if (eqId) {
							borrowedMap[eqId] =
								(borrowedMap[eqId] || 0) + (b.quantity ?? 0);
						}
					}
				});

				// Merge available quantity
				const items = equipmentsRes.equipments.map((e) => ({
					id: e.id,
					name: e.name,
					image: e.image?.url || "/Images/t_beaker.png",
					totalQuantity: e.quantity ?? 0,
					availableQuantity:
						(e.quantity ?? 0) - (borrowedMap[e.id] || 0),
				}));

				setAvailableItems(items);
			} catch (err) {
				console.error("Failed to fetch data:", err);
			}
		}
		fetchData();
	}, []);

	const addItem = (item) => {
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

	const removeItem = (itemId) => {
		setSelectedItems((prev) => prev.filter((s) => s.item.id !== itemId));
	};

	const adjustQuantity = (itemId, delta) => {
		setSelectedItems((prev) =>
			prev
				.map((s) =>
					s.item.id === itemId
						? {
								...s,
								quantity: Math.min(
									Math.max(s.quantity + delta, 1),
									s.item.availableQuantity
								),
						  }
						: s
				)
				.filter((s) => s.quantity > 0)
		);
	};

	const handleSubmitBooking = async () => {
		if (!selectedItems.length || !user) return;

		const bookingData = selectedItems.map((s) => ({
			equipmentId: s.item.id,
			quantity: s.quantity,
			startTime: startDate.toISOString(),
			endTime: endDate.toISOString(),
			userEmail: user.emailAddresses[0].emailAddress,
		}));

		try {
			const res = await fetch("/api/book-equipment", {
				method: "POST",
				body: JSON.stringify({ bookingData }),
			});
			const result = await res.json();
			console.log("Booking result:", result);

			setSelectedItems([]);
			setShowTimepicker(false);
		} catch (err) {
			console.error("Booking failed:", err);
		}
	};

	return (
		<div className="flex flex-col w-full h-full">
			{/* Header */}
			<div className="flex flex-col ml-[10%] mt-[5%]">
				<span className="text-[40px]">Borrow Equipments</span>
				<span className="text-[12px] mt-[5px]">
					View and search lab equipments
				</span>
			</div>

			{/* Available Items */}
			<div className="grid grid-cols-3 w-full gap-4 px-[10%] mt-[20px] mb-[300px]">
				{availableItems.map((item) => (
					<div
						key={item.id}
						className="w-full flex flex-col bg-gray-100 rounded-xl overflow-hidden"
					>
						<div className="relative w-full h-[300px] border-t rounded-xl">
							<Image
								src={item.image}
								className="object-cover"
								fill
								alt={item.name}
							/>
						</div>
						<div className="flex flex-col px-[15px] mt-[3px]">
							<span>{item.name}</span>
							<div className="bg-amber-400 w-fit px-[15px] py-[2px] rounded-lg mt-[5px]">
								<span>
									{item.availableQuantity}pc(s) available
								</span>
							</div>
							<div
								onClick={() => addItem(item)}
								className="h-[30px] bg-black text-white mt-[14px] mb-[10px] flex justify-center items-center rounded-xl cursor-pointer"
							>
								<span>Add Item</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Selected Items */}
			<div className="h-[180px] fixed border-4 border-gray-300 bg-gray-200 rounded-lg bottom-0 right-[10%] left-[15%] p-4 overflow-y-auto">
				{selectedItems.map((s) => (
					<div
						key={s.item.id}
						className="flex items-center justify-between mb-2"
					>
						<span>{s.item.name}</span>
						<div className="flex items-center gap-2">
							<button
								onClick={() => adjustQuantity(s.item.id, -1)}
							>
								<SquareMinus />
							</button>
							<span>{s.quantity}</span>
							<button
								onClick={() => adjustQuantity(s.item.id, 1)}
							>
								<SquarePlus />
							</button>
							<button
								onClick={() => removeItem(s.item.id)}
								className="ml-2 text-red-500 font-bold"
							>
								X
							</button>
						</div>
					</div>
				))}
				{selectedItems.length > 0 && (
					<button
						onClick={() => setShowTimepicker(true)}
						className="bg-black text-white px-6 py-2 rounded-lg mt-2"
					>
						Confirm
					</button>
				)}
			</div>
		</div>
	);
};

export default Borrow;
