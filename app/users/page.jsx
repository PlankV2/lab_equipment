"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { GraphQLClient, gql } from "graphql-request";
import { useUser } from "@clerk/nextjs";

/* ---------------- HYGRAPH CLIENT ---------------- */
const hygraph = new GraphQLClient(process.env.NEXT_PUBLIC_HYGRAPH_API_URL, {
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_HYGRAPH_API_TOKEN}`,
  },
});

/* ---------------- ADMIN EMAILS ---------------- */
// Add more admin emails here as needed — no logic changes required
const ADMIN_EMAILS = [
  "amar-erdenebatsuren@hobbyschool.edu.mn",
];

/* ---------------- LAB ROLES (Hygraph UserRole enum) ---------------- */
// These are lab-level roles stored in Hygraph, completely separate from Clerk auth
const LAB_ROLES = ["Student", "Teacher"];

/* ---------------- QUERIES ---------------- */
// Profiles are fetched without nested bookings — Hygraph only returns
// PUBLISHED nested relations by default, which would zero-out draft counts.
const GET_PROFILES = gql`
  query GetProfiles {
    profiles(first: 500) {
      id
      name
      email
      role
    }
  }
`;

// Bookings are fetched in two separate stage-explicit queries, then merged —
// identical to the strategy used in Inventory.jsx so draft (pending) bookings
// are never silently dropped.
const GET_BOOKINGS_FOR_USERS = gql`
  query GetBookingsForUsers {
    draftBookings: bookings(stage: DRAFT, first: 1000, orderBy: startTime_DESC) {
      id
      stage
      quantity
      startTime
      endTime
      profile {
        id
      }
      equipment {
        id
        name
        image {
          url
        }
      }
    }
    publishedBookings: bookings(stage: PUBLISHED, first: 1000, orderBy: startTime_DESC) {
      id
      stage
      quantity
      startTime
      endTime
      profile {
        id
      }
      equipment {
        id
        name
        image {
          url
        }
      }
    }
  }
`;



/* ── helpers ── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth)
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.getDate()}, ${e.getFullYear()}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function bookingStatus(booking) {
  const now = new Date();
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  if (booking.stage === "DRAFT") return "pending";
  if (end < now) return "returned";
  if (start <= now && now <= end) return "active";
  return "upcoming";
}

const STATUS_META = {
  active:   { label: "Active",   dot: "bg-emerald-400", text: "text-emerald-700", row: "border-emerald-200 bg-emerald-50" },
  upcoming: { label: "Upcoming", dot: "bg-blue-400",    text: "text-blue-700",   row: "border-blue-100 bg-blue-50"      },
  pending:  { label: "Pending",  dot: "bg-amber-400",   text: "text-amber-700",  row: "border-amber-200 bg-amber-50"    },
  returned: { label: "Returned", dot: "bg-gray-300",    text: "text-gray-500",   row: "border-gray-100 bg-gray-50"      },
};

const ROLE_BADGE = {
  Teacher: "bg-indigo-50 text-indigo-700",
  Student: "bg-gray-100 text-gray-600",
};

/* ── Avatar sub-component ── */
function Avatar({ profile, size = "w-8 h-8", textSize = "text-[11px]" }) {
  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (profile.clerkImageUrl) {
    return (
      <img
        src={profile.clerkImageUrl}
        alt={profile.displayName}
        className={`${size} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-gray-100 flex items-center justify-center ${textSize} font-semibold text-gray-600 shrink-0`}
    >
      {initials}
    </div>
  );
}

/* ================================================= */
export default function Users() {
  const { user: clerkUser } = useUser();

  // isAdmin is derived from ADMIN_EMAILS — completely separate from Hygraph's `role` field
  const isAdmin =
    clerkUser?.emailAddresses?.some((e) =>
      ADMIN_EMAILS.includes(e.emailAddress)
    ) ?? false;

  const [profiles, setProfiles]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [clerkWarning, setClerkWarning]     = useState(false); // Clerk degraded gracefully
  const [search, setSearch]                 = useState("");
  const [filterRole, setFilterRole]         = useState("All");
  const [filterActivity, setFilterActivity] = useState("All"); // "All" | "NeverBooked"
  const [selected, setSelected]             = useState(null);

  /* ---------------- FETCH ---------------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setClerkWarning(false);
    try {
      // Hygraph is the source of truth for profiles — must succeed
      const [hygraphProfilesRes, hygraphBookingsRes] = await Promise.all([
        hygraph.request(GET_PROFILES),
        hygraph.request(GET_BOOKINGS_FOR_USERS),
      ]);

      // ── Deduplicate: PUBLISHED wins over DRAFT for the same booking ID ──
      const seenIds = new Set();
      const allBookings = [];
      for (const b of hygraphBookingsRes.publishedBookings) {
        seenIds.add(b.id);
        allBookings.push(b);
      }
      for (const b of hygraphBookingsRes.draftBookings) {
        if (!seenIds.has(b.id)) allBookings.push(b);
      }

      // ── Group bookings by profile ID, sorted newest-first ──
      const bookingsByProfile = {};
      for (const b of allBookings) {
        const pid = b.profile?.id;
        if (!pid) continue;
        if (!bookingsByProfile[pid]) bookingsByProfile[pid] = [];
        bookingsByProfile[pid].push(b);
      }
      for (const pid in bookingsByProfile) {
        bookingsByProfile[pid].sort(
          (a, b) => new Date(b.startTime) - new Date(a.startTime)
        );
      }

      // Clerk enriches names/avatars — failure is non-fatal, we degrade gracefully
      let clerkByEmail = {};
      try {
        const clerkRes = await fetch("@/app/api/clerk-users/route.js").then((r) => {
          if (!r.ok) throw new Error(`Clerk API responded ${r.status}`);
          return r.json();
        });
        if (Array.isArray(clerkRes)) {
          clerkRes.forEach((u) => {
            if (u.email) clerkByEmail[u.email.toLowerCase()] = u;
          });
        }
      } catch (clerkErr) {
        console.warn("[Users] Clerk fetch failed — showing Hygraph names only:", clerkErr.message);
        setClerkWarning(true);
      }

      // Merge: Clerk fullName wins over Hygraph name; bookings stitched by profile ID
      const merged = (hygraphProfilesRes.profiles ?? []).map((p) => {
        const clerk = p.email ? clerkByEmail[p.email.toLowerCase()] : null;
        return {
          ...p,
          displayName:
            clerk?.fullName ||
            p.name ||
            p.email?.split("@")[0] ||
            "Unknown",
          labRole: p.role ?? null,
          isAdminUser: ADMIN_EMAILS.includes(p.email?.toLowerCase()),
          clerkImageUrl: clerk?.imageUrl ?? null,
          bookings: bookingsByProfile[p.id] ?? [],
        };
      });

      setProfiles(merged);
    } catch (err) {
      console.error("[Users] Failed to fetch Hygraph profiles:", err);
      setError("Could not load users. Check your Hygraph credentials and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ---------------- STATS ── */
  const getStats = (profile) => {
    const now = new Date();
    const bookings = profile.bookings ?? [];
    return {
      total:   bookings.length,
      active:  bookings.filter(
        (b) =>
          b.stage === "PUBLISHED" &&
          new Date(b.startTime) <= now &&
          now <= new Date(b.endTime)
      ).length,
      pending: bookings.filter((b) => b.stage === "DRAFT").length,
    };
  };

  /* ---------------- FILTER ── */
  const roles = useMemo(() => {
    const set = new Set(profiles.map((p) => p.labRole).filter(Boolean));
    return ["All", ...LAB_ROLES.filter((r) => set.has(r))];
  }, [profiles]);

  const filtered = useMemo(() => {
    let list = profiles;
    if (filterRole !== "All")
      list = list.filter((p) => p.labRole === filterRole);
    if (filterActivity === "NeverBooked")
      list = list.filter((p) => (p.bookings ?? []).length === 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [profiles, filterRole, filterActivity, search]);

  /* ── Close on Escape ── */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ================================================= */
  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm tracking-widest uppercase">
        Loading users…
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={fetchData}
          className="text-[11px] font-semibold uppercase tracking-widest border border-gray-300 px-4 py-2 rounded-lg hover:border-black transition-colors"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="flex flex-col w-full pb-20">

      {/* ── HEADER ── */}
      <div className="ml-[10%] mt-[5%]">
        <div className="flex items-center gap-3">
          <span className="text-[40px] font-light tracking-tight">Users</span>
          {isAdmin && (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white bg-black px-2.5 py-1 rounded-full">
              Admin
            </span>
          )}
        </div>
        <p className="text-[12px] text-gray-400 mt-1">
          Browse all registered profiles and their booking history
        </p>

      </div>

      {/* ── SEARCH ── */}
      <div className="ml-[10%] mt-4 w-[80%]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:max-w-xs text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* ── FILTER PILLS ── */}
      <div className="ml-[10%] mt-3 flex gap-2 flex-wrap items-center">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
              filterRole === r
                ? "bg-black text-white border-black"
                : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
            }`}
          >
            {r}
          </button>
        ))}

        <span className="w-px h-4 bg-gray-200 mx-1" />

        <button
          onClick={() =>
            setFilterActivity((v) => (v === "NeverBooked" ? "All" : "NeverBooked"))
          }
          className={`text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
            filterActivity === "NeverBooked"
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
          }`}
        >
          Never booked
        </button>
      </div>

      {/* ── COLUMN HEADERS ── */}
      <div className="mx-[10%] mt-5 grid grid-cols-[2fr_2fr_1fr_80px_80px_80px] gap-4 px-5 text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
        <span>Name</span>
        <span>Email</span>
        <span>Lab Role</span>
        <span className="text-center">Total</span>
        <span className="text-center">Active</span>
        <span className="text-center">Pending</span>
      </div>

      {/* ── USER ROWS ── */}
      <div className="flex flex-col gap-1.5 mt-2 mx-[10%]">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 py-10 text-center">
            {filterActivity === "NeverBooked"
              ? "Everyone has booked at least once — no inactive users found."
              : "No users match your search."}
          </p>
        )}

        {filtered.map((profile) => {
          const { active, pending, total } = getStats(profile);

          return (
            <button
              key={profile.id}
              onClick={() => setSelected(profile)}
              className="grid grid-cols-[2fr_2fr_1fr_80px_80px_80px] gap-4 items-center px-5 py-3.5 border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50/60 transition-all text-left"
            >
              {/* Name + avatar */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar profile={profile} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-gray-800 truncate leading-tight">
                    {profile.displayName}
                  </span>
                  {profile.isAdminUser && (
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-white bg-black px-1.5 py-0.5 rounded-full w-fit mt-0.5">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <span className="text-sm text-gray-500 truncate">{profile.email}</span>

              {/* Lab role (Hygraph) */}
              <span>
                {profile.labRole ? (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${ROLE_BADGE[profile.labRole] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {profile.labRole}
                  </span>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </span>

              {/* Total */}
              <span className={`text-sm font-semibold text-center ${total === 0 ? "text-gray-300" : "text-gray-700"}`}>
                {total === 0 ? "—" : total}
              </span>

              {/* Active */}
              <span className={`text-sm font-semibold text-center ${active > 0 ? "text-emerald-600" : "text-gray-300"}`}>
                {active > 0 ? active : "—"}
              </span>

              {/* Pending */}
              <span className={`text-sm font-semibold text-center ${pending > 0 ? "text-amber-500" : "text-gray-300"}`}>
                {pending > 0 ? pending : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── FOOTER COUNT ── */}
      {filtered.length > 0 && (
        <p className="ml-[10%] mt-3 text-[11px] text-gray-400">
          Showing {filtered.length} of {profiles.length} users
          {filterActivity === "NeverBooked" && " · never booked"}
        </p>
      )}

      {/* ── POPUP ── */}
      {selected && (
        <BookingHistoryModal
          profile={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/* ================================================= */
function BookingHistoryModal({ profile, onClose }) {
  const bookings = profile.bookings ?? [];
  const now = new Date();
  const stats = {
    total:   bookings.length,
    active:  bookings.filter(
      (b) =>
        b.stage === "PUBLISHED" &&
        new Date(b.startTime) <= now &&
        now <= new Date(b.endTime)
    ).length,
    pending: bookings.filter((b) => b.stage === "DRAFT").length,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-[600px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <Avatar profile={profile} size="w-11 h-11" textSize="text-sm" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[17px] font-semibold text-gray-900 truncate">
                {profile.displayName}
              </span>
              {/* Admin takes visual priority; otherwise show lab role */}
              {profile.isAdminUser ? (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white bg-black px-2 py-0.5 rounded-full">
                  Admin
                </span>
              ) : profile.labRole ? (
                <span
                  className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${ROLE_BADGE[profile.labRole] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {profile.labRole}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{profile.email}</p>
          </div>

          {/* Mini stats */}
          <div className="flex items-center gap-3 shrink-0 mr-8">
            {[
              { label: "Total",   value: stats.total,   color: stats.total   > 0 ? "text-gray-800"    : "text-gray-300" },
              { label: "Active",  value: stats.active,  color: stats.active  > 0 ? "text-emerald-600" : "text-gray-300" },
              { label: "Pending", value: stats.pending, color: stats.pending > 0 ? "text-amber-500"   : "text-gray-300" },
            ].map(({ label, value, color }, i, arr) => (
              <React.Fragment key={label}>
                <div className="text-center">
                  <div className={`text-[18px] font-light leading-none ${color}`}>{value}</div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-0.5">{label}</div>
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 bg-gray-200" />}
              </React.Fragment>
            ))}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* BOOKING LIST */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
          {bookings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span className="text-sm">No bookings yet</span>
            </div>
          )}

          {bookings.map((b) => {
            const status = bookingStatus(b);
            const meta   = STATUS_META[status];
            const eq     = b.equipment;

            return (
              <div
                key={b.id}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border ${meta.row}`}
              >
                {eq?.image?.url ? (
                  <img
                    src={eq.image.url}
                    alt={eq.name}
                    className="w-9 h-9 object-contain shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0" />
                )}

                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {eq?.name ?? "Unknown equipment"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {formatRange(b.startTime, b.endTime)} · qty {b.quantity ?? 0}
                  </span>
                </div>

                <div className={`flex items-center gap-1.5 shrink-0 text-[10px] font-semibold uppercase tracking-widest ${meta.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-[12px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}