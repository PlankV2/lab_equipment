import { hygraph } from "@/lib/hygraph";
import { gql } from "graphql-request";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const body = await req.json();
		const { bookingData } = body;

		if (!bookingData || !bookingData.length) {
			return NextResponse.json(
				{ error: "No booking data" },
				{ status: 400 }
			);
		}

		const results = [];

		for (const b of bookingData) {
			const { equipmentId, startTime, endTime, userEmail, quantity } = b;

			if (!quantity || quantity <= 0) {
				return NextResponse.json(
					{ error: "Invalid quantity" },
					{ status: 400 }
				);
			}

			// Step 1: Find or create profile
			const GET_PROFILE = gql`
				query GetProfile($email: String!) {
					profiles(where: { email_contains: $email }) {
						id
						email
					}
				}
			`;

			let profileRes = await hygraph.request(GET_PROFILE, {
				email: userEmail,
			});
			let profile;

			if (!profileRes.profiles.length) {
				const CREATE_PROFILE = gql`
					mutation CreateProfile($email: String!) {
						createProfile(data: { email: $email }) {
							id
							email
						}
					}
				`;
				const createRes = await hygraph.request(CREATE_PROFILE, {
					email: userEmail,
				});
				profile = createRes.createProfile;
			} else {
				profile = profileRes.profiles[0];
			}

			// Step 2: Create booking
			const CREATE_BOOKING = gql`
				mutation CreateBooking(
					$equipmentId: ID!
					$profileId: ID!
					$quantity: Int!
					$startTime: DateTime!
					$endTime: DateTime!
				) {
					createBooking(
						data: {
							equipment: { connect: { id: $equipmentId } }
							profile: { connect: { id: $profileId } }
							quantity: $quantity
							startTime: $startTime
							endTime: $endTime
							status_: confirmed
						}
					) {
						id
						quantity
						startTime
						endTime
					}
				}
			`;

			const bookingRes = await hygraph.request(CREATE_BOOKING, {
				equipmentId,
				profileId: profile.id,
				quantity,
				startTime,
				endTime,
			});

			results.push(bookingRes.createBooking);
		}

		return NextResponse.json({ bookings: results });
	} catch (err) {
		console.error("Booking error:", err);
		return NextResponse.json(
			{ error: err.message || "Server error" },
			{ status: 500 }
		);
	}
}
