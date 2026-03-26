// app/api/clerk-users/route.js
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const response = await clerkClient.users.getUserList({ limit: 500 });

    const payload = response.data.map((u) => ({
      clerkId: u.id,
      fullName:
        [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || null,
      email:
        u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)
          ?.emailAddress ?? null,
      imageUrl: u.imageUrl ?? null,
    }));

    return Response.json(payload);
  } catch (err) {
    console.error("[clerk-users] Failed to fetch users:", err);
    return Response.json({ error: "Failed to fetch Clerk users" }, { status: 500 });
  }
}