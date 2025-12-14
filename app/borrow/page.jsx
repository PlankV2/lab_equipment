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

const Borrow = () => {
	const [availableItems, setAvailableItems] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]);
	const [showTimepicker, setShowTimepicker] = useState(false);
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(new Date());

	const { user } = useUser();

	console.log("HYGRAPH_API_URL:", process.env.NEXT_PUBLIC_HYGRAPH_API_URL);

	// Fetch equipments from Hygraph on mount
	useEffect(() => {
		async function fetchEquipments() {
			try {
				const res = await hygraph.request(GET_EQUIPMENTS);
				console.log("Hygraph equipments raw response:", res);
				setAvailableItems(
					res.equipments.map((e) => ({
						id: e.id,
						name: e.name,
						quantity: e.quantity,
						image: e.image?.url || "/Images/t_beaker.png",
					}))
				);
			} catch (err) {
				console.error("Failed to fetch equipments:", err);
			}
		}
		fetchEquipments();
	}, []);

	const addItem = (item) => {
		setSelectedItems((prev) => {
			const exists = prev.find((s) => s.item.id === item.id);
			if (exists) {
				if (exists.quantity < item.quantity) {
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
									s.item.quantity
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
			equipmentId: s.item.id, // real Hygraph ID
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

			{/* Category Menu */}
			<div className="flex mt-[50px] px-[10%] items-stretch">
				<div className="flex flex-col">
					<div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px]">
						<FlaskConical />{" "}
						<span className="ml-[10px]">Glassware</span>
					</div>
					<div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px]">
						<Database />{" "}
						<span className="ml-[10px]">Plasticware</span>
					</div>
					<div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px]">
						<Diff /> <span className="ml-[10px]">Lab Stands</span>
					</div>
					<div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px] items-center">
						<Scale />{" "}
						<span className="ml-[10px]">Balances & Scale</span>
					</div>
				</div>

				<div className="w-[1px] bg-black ml-[20px]"></div>

				{/* Available Items */}
				<div className="grid grid-cols-3 w-full gap-4 px-5">
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
									<span>{item.quantity}pc(s) left</span>
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
			</div>

			{/* Selected Items Menu */}
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

			{/* React Datepicker Modal */}
			{showTimepicker && (
				<div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
					<div className="bg-white p-6 rounded-lg w-[400px] flex flex-col gap-4">
						<h2 className="text-xl font-bold">
							Select Borrow Timeframe
						</h2>

						<div className="flex flex-col gap-2">
							<label className="flex flex-col">
								Start Date & Time:
								<DatePicker
									selected={startDate}
									onChange={(date) => setStartDate(date)}
									showTimeSelect
									timeFormat="HH:mm"
									timeIntervals={15}
									dateFormat="Pp"
									className="border p-1 rounded w-full mt-1"
								/>
							</label>

							<label className="flex flex-col">
								End Date & Time:
								<DatePicker
									selected={endDate}
									onChange={(date) => setEndDate(date)}
									showTimeSelect
									timeFormat="HH:mm"
									timeIntervals={15}
									dateFormat="Pp"
									className="border p-1 rounded w-full mt-1"
								/>
							</label>
						</div>

						<div className="flex justify-end gap-2 mt-2">
							<button
								onClick={() => setShowTimepicker(false)}
								className="px-4 py-2 rounded border"
							>
								Cancel
							</button>
							<button
								onClick={handleSubmitBooking}
								className="px-4 py-2 rounded bg-black text-white"
							>
								Submit
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Borrow;
