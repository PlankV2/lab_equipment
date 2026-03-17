"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { GraphQLClient, gql } from "graphql-request";
import { useUser } from "@clerk/nextjs";

/* ---------------- HYGRAPH CLIENT ---------------- */
const hygraph = new GraphQLClient(
  process.env.NEXT_PUBLIC_HYGRAPH_API_URL,
  {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_HYGRAPH_API_TOKEN}`,
    },
  }
);

/* ---------------- ADMIN EMAIL ---------------- */
const ADMIN_EMAIL = "amar-erdenebatsuren@hobbyschool.edu.mn";

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
    draftBookings: bookings(stage: DRAFT, orderBy: startTime_ASC, first: 100) {
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

    publishedBookings: bookings(stage: PUBLISHED, orderBy: startTime_ASC, first: 100) {
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

/* ---------------- MUTATIONS ---------------- */
const PUBLISH_BOOKING = gql`
  mutation PublishBooking($id: ID!) {
    publishBooking(where: { id: $id }, to: PUBLISHED) {
      id
      stage
    }
  }
`;

const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(where: { id: $id }) {
      id
    }
  }
`;

const UNPUBLISH_BOOKING = gql`
  mutation UnpublishBooking($id: ID!) {
    unpublishBooking(where: { id: $id }, from: PUBLISHED) {
      id
      stage
    }
  }
`;

/* ================================================= */
export default function Inventory() {
  const { user } = useUser();
  const isAdmin =
    user?.emailAddresses?.some((e) => e.emailAddress === ADMIN_EMAIL) ?? false;

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  /* ---------------- FETCH ---------------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [equipmentsRes, bookingsRes] = await Promise.all([
        hygraph.request(GET_EQUIPMENTS),
        hygraph.request(GET_BOOKINGS),
      ]);

      const now = new Date();

      // Deduplicate: if a booking id exists in both draft and published,
      // the PUBLISHED version wins — the draft is just its working copy.
      const seenIds = new Set();
      const bookings = [];

      for (const b of bookingsRes.publishedBookings) {
        seenIds.add(b.id);
        bookings.push(b);
      }
      for (const b of bookingsRes.draftBookings) {
        if (!seenIds.has(b.id)) {
          bookings.push(b);
        }
      }

      const eqMap = {};

      equipmentsRes.equipments.forEach((eq) => {
        eqMap[eq.id] = {
          ...eq,
          totalQuantity: eq.quantity ?? 0,
          borrowed: 0,
          logs: [],
        };
      });

      bookings.forEach((b) => {
        const eqId = b.equipment?.id;
        if (!eqId || !eqMap[eqId]) return;

        const quantity = b.quantity ?? 0;
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);

        if (end < now) return;

        const isActiveNow =
          start <= now && now <= end && b.stage === "PUBLISHED";

        if (isActiveNow) {
          eqMap[eqId].borrowed += quantity;
        }

        eqMap[eqId].logs.push({ ...b, isActiveNow });
      });

      const result = Object.values(eqMap)
        .filter((item) => item.logs.length > 0)
        .map((item) => ({
          ...item,
          logs: item.logs.sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          ),
          hasDraft: item.logs.some((l) => l.stage === "DRAFT"),
        }));

      setInventory(result);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------------- ACTIONS ---------------- */
  const handleConfirm = async (id) => {
    setActionLoading(id);
    try {
      await hygraph.request(PUBLISH_BOOKING, { id });
      await fetchData();
    } catch (err) {
      console.error("Confirm failed:", err?.response?.errors ?? err);
      alert(
        "Confirm failed: " +
          (err?.response?.errors?.[0]?.message ?? "Unknown error")
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    setActionLoading(id);
    try {
      await hygraph.request(DELETE_BOOKING, { id });
      await fetchData();
    } catch (err) {
      console.error("Delete failed:", err?.response?.errors ?? err);
      alert(
        "Delete failed: " +
          (err?.response?.errors?.[0]?.message ?? "Unknown error")
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Admin-only: cancel an already-published (active/upcoming) booking
  const handleAdminCancel = async (id) => {
    if (!isAdmin) return;
    setActionLoading(id);
    try {
      // Must unpublish before deleting in Hygraph
      await hygraph.request(UNPUBLISH_BOOKING, { id });
      await hygraph.request(DELETE_BOOKING, { id });
      await fetchData();
    } catch (err) {
      console.error("Admin cancel failed:", err?.response?.errors ?? err);
      alert(
        "Cancel failed: " +
          (err?.response?.errors?.[0]?.message ?? "Unknown error")
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* ---------------- SEARCH ---------------- */
  const filteredInventory = useMemo(() => {
    if (!search.trim()) return inventory;
    const q = search.toLowerCase();
    return inventory.filter((item) => item.name.toLowerCase().includes(q));
  }, [inventory, search]);

  /* ---------------- CARD STYLE ---------------- */
  const getCardStyle = (item) => {
    const available = item.totalQuantity - item.borrowed;
    if (available < 0) return "bg-red-50 border-red-300";
    if (item.hasDraft) return "bg-amber-50 border-amber-300";
    if (item.logs.some((l) => l.stage === "PUBLISHED"))
      return "bg-emerald-50 border-emerald-300";
    return "border-gray-200";
  };

  const getStatusDot = (item) => {
    const available = item.totalQuantity - item.borrowed;
    if (available < 0) return "bg-red-400";
    if (item.hasDraft) return "bg-amber-400";
    if (item.logs.some((l) => l.stage === "PUBLISHED"))
      return "bg-emerald-400";
    return "bg-gray-300";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm tracking-widest uppercase">
        Loading inventory…
      </div>
    );

  return (
    <div className="flex flex-col w-full pb-20">
      {/* HEADER */}
      <div className="ml-[10%] mt-[5%]">
        <div className="flex items-center gap-3">
          <span className="text-[40px] font-light tracking-tight">Inventory</span>
          {isAdmin && (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white bg-black px-2.5 py-1 rounded-full">
              Admin
            </span>
          )}
        </div>
        <p className="text-[12px] text-gray-400 mt-1">
          View and manage lab equipment bookings
        </p>
      </div>

      {/* SEARCH */}
      <div className="ml-[10%] mt-4 w-[50%]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* LEGEND */}
      <div className="ml-[10%] mt-3 flex gap-5 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Active booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Pending approval
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          Over capacity
        </span>
      </div>

      {/* INVENTORY LIST */}
      <div className="flex flex-col gap-3 mt-6 mx-[10%]">
        {filteredInventory.length === 0 && (
          <p className="text-sm text-gray-400 py-10 text-center">
            No active bookings found.
          </p>
        )}

        {filteredInventory.map((item) => {
          const available = item.totalQuantity - item.borrowed;

          return (
            <div
              key={item.id}
              className={`flex gap-5 px-5 py-4 border rounded-xl ${getCardStyle(item)} transition-all`}
            >
              {/* STATUS DOT + IMAGE + NAME */}
              <div className="flex items-center gap-3 w-[240px] shrink-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusDot(item)}`} />
                <Image
                  width={60}
                  height={60}
                  src={item.image?.url || "/Images/t_beaker.png"}
                  alt={item.name}
                  className="object-contain"
                />
                <span className="text-sm font-medium leading-tight">{item.name}</span>
              </div>

              {/* DIVIDER */}
              <div className="w-px bg-gray-200 self-stretch" />

              {/* STATS */}
              <div className="flex flex-col justify-center gap-1 w-[110px] shrink-0 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-medium text-gray-800">{item.totalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Borrowed</span>
                  <span className="font-medium text-gray-800">{item.borrowed}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                  <span>Available</span>
                  <span
                    className={`font-semibold ${
                      available < 0
                        ? "text-red-500"
                        : available === 0
                        ? "text-amber-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {available}
                  </span>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="w-px bg-gray-200 self-stretch" />

              {/* BOOKING LOGS */}
              <div className="flex flex-col flex-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {item.logs.map((log) => {
                  const start = new Date(log.startTime);
                  const end = new Date(log.endTime);
                  const isLoadingThis = actionLoading === log.id;
                  const isPublished = log.stage === "PUBLISHED";

                  return (
                    <div
                      key={log.id}
                      className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 gap-3 ${
                        log.isActiveNow
                          ? "bg-emerald-100 text-emerald-800"
                          : log.stage === "DRAFT"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {/* LOG INFO */}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-medium truncate">
                          {log.profile?.name || log.profile?.email || "Unknown"}
                        </span>
                        <span className="opacity-70">
                          {start.toLocaleDateString()} → {end.toLocaleDateString()} · qty {log.quantity ?? 0}
                        </span>
                      </div>

                      {/* STAGE BADGE + ACTIONS */}
                      <div className="flex items-center gap-2 shrink-0">
                        {log.stage === "DRAFT" ? (
                          <>
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-50">
                              Pending
                            </span>
                            {isAdmin && (
                              <>
                                <button
                                  disabled={isLoadingThis}
                                  onClick={() => handleConfirm(log.id)}
                                  className="flex items-center gap-1 text-[11px] font-semibold bg-black text-white px-2.5 py-1 rounded-md hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isLoadingThis ? (
                                    <span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" />
                                  ) : (
                                    "✓ Approve"
                                  )}
                                </button>
                                <button
                                  disabled={isLoadingThis}
                                  onClick={() => handleCancel(log.id)}
                                  className="text-[11px] font-semibold bg-white text-gray-600 border border-gray-300 px-2.5 py-1 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <span
                              className={`text-[10px] uppercase tracking-wider font-semibold ${
                                log.isActiveNow ? "text-emerald-700" : "text-gray-400"
                              }`}
                            >
                              {log.isActiveNow ? "● Active" : "Upcoming"}
                            </span>
                            {isAdmin && isPublished && (
                              <button
                                disabled={isLoadingThis}
                                onClick={() => handleAdminCancel(log.id)}
                                className="group flex items-center gap-1.5 text-[11px] font-medium text-red-500 border border-red-200 bg-white px-2.5 py-1 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                              >
                                {isLoadingThis ? (
                                  <span className="animate-spin inline-block w-3 h-3 border border-red-400 border-t-transparent rounded-full group-hover:border-white group-hover:border-t-transparent" />
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                                    </svg>
                                    Cancel
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
