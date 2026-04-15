"use client";

import { useState, useEffect } from "react";

export default function MissingItemPage() {
  const [items, setItems] = useState([
    {
      id: "1",
      name: "Missing Item 1",
      imageUrl: "/images/missing-item-1.png",
      status: "Missing",
    },
    {
      id: "2",
      name: "Missing Item 2",
      imageUrl: "/images/missing-item-2.png",
      status: "Missing",
    },
  ]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
  });

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Missing":
        return "bg-red-500";
      case "Found":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      id: Date.now().toString(),
      name: formData.itemName,
      imageUrl: "/images/missing-item-1.png",
      status: "Missing",
    };

    setItems((prev) => [newItem, ...prev]);
    setFormData({ itemName: "", description: "" });
    closeModal();
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* HEADER */}
      <div className="w-full px-6 py-8 bg-white border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Missing Items
            </h1>
            <p className="text-gray-600 mt-1">
              Track and report lost or damaged items.
            </p>
          </div>

          <button
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow transition"
          >
            + Report Item
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full px-6 py-8">
        {items.length === 0 ? (
          <div className="w-full text-center py-24 text-gray-500">
            <p className="text-lg">No missing items yet</p>
            <p className="text-sm mt-2">
              Click “Report Item” to add one
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="w-full bg-white rounded-xl border shadow-sm hover:shadow-md transition p-4 flex flex-col"
              >
                {/* IMAGE */}
                <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md mb-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-h-full object-contain"
                    onError={(e) =>
                      (e.currentTarget.src = "/fallback.png")
                    }
                  />
                </div>

                {/* INFO */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <span
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    />
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    Status: {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Report Item
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Item name"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the issue..."
                rows={4}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}