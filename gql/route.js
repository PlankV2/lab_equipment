// app/api/book-equipment/route.ts
import { hygraph } from "@/lib/hygraph";
import { auth } from "@clerk/nextjs/server";
import { gql } from "graphql-request";

export async function POST(req) {
	const { userId, sessionId, getToken } = auth();
	if (!userId) return new Response("Unauthorized", { status: 401 });

	const body = await req.json();
	const { equipmentId, startTime, endTime } = body;

	// Optional: get user info from Clerk
	const token = await getToken();
	const userEmail = token?.email || "demo@hobbyschool.edu.mn";

	// Step 1: check if user exists in Hygraph
	const GET_USER = gql`
		query GetUser($email: String!) {
			user(where: { email: $email }) {
				id
			}
		}
	`;

	const CREATE_USER = gql`
		mutation CreateUser($email: String!, $name: String) {
			createUser(data: { email: $email, name: $name }) {
				id
			}
		}
	`;

	let user;
	const res = await hygraph.request(GET_USER, { email: userEmail });
	if (!res.user) {
		const createRes = await hygraph.request(CREATE_USER, {
			email: userEmail,
			name: "Demo User", // you can get full name from Clerk too
		});
		user = createRes.createUser;
	} else {
		user = res.user;
	}

	// Step 2: create booking
	const CREATE_BOOKING = gql`
		mutation CreateBooking(
			$equipmentId: ID!
			$userId: ID!
			$startTime: DateTime!
			$endTime: DateTime!
		) {
			createBooking(
				data: {
					equipment: { connect: { id: $equipmentId } }
					user: { connect: { id: $userId } }
					startTime: $startTime
					endTime: $endTime
					status: CONFIRMED
				}
			) {
				id
			}
		}
	`;

	const booking = await hygraph.request(CREATE_BOOKING, {
		equipmentId,
		userId: user.id,
		startTime,
		endTime,
	});

	return new Response(JSON.stringify(booking), { status: 200 });
}
