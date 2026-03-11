import {
  Package,
  Briefcase,
  ArrowUpCircle,
  TriangleAlert,
} from "lucide-react";

const stats = [
  { title: "Total Items", value: 120, icon: Package },
  { title: "Remaining Items", value: 85, icon: Briefcase },
  { title: "Taken Items", value: 30, icon: ArrowUpCircle },
  { title: "Damaged/Missing Items", value: 5, icon: TriangleAlert },
];

const outOfInventory = [
  { name: "Flask", count: 0 },
  { name: "Dropper", count: 0 },
];

const inInventory = [
  { name: "Beaker", count: 12 },
  { name: "Lab Coat", count: 15 },
  { name: "Burette", count: 9 },
];

const getInventoryColor = (count) => {
  if (count === 0) return "bg-red-100 text-red-700";
  if (count <= 5) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const StatCard = ({ title, value, Icon }) => {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">{title}</span>

        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon size={18} className="text-blue-600" />
        </div>
      </div>

      <div className="mt-4">
        <span className="text-3xl font-bold">{value}</span>
        <p className="text-sm text-gray-400">Active Inventory Status</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col p-8 gap-10">

      <h1 className="text-4xl font-bold tracking-tight">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            Icon={item.icon}
          />
        ))}
      </div>

      <div className="bg-white shadow-sm rounded-2xl p-6">

        <h2 className="text-lg font-semibold mb-6">
          Inventory Status
        </h2>

        <div className="mb-8">
          <h3 className="text-red-600 font-semibold mb-2">
            Out of Inventory
          </h3>

          {outOfInventory.map((item, index) => (
            <div
              key={index}
              className="flex justify-between bg-red-50 rounded-lg px-5 py-3 my-2"
            >
              <span>{item.name}</span>

              <span className="bg-red-200 px-4 py-1 rounded-md text-sm">
                {item.count} pcs
              </span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-green-600 font-semibold mb-2">
            Still in Inventory
          </h3>

          {inInventory.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between rounded-lg px-5 py-3 my-2 ${getInventoryColor(
                item.count
              )}`}
            >
              <span>{item.name}</span>

              <span className="bg-white/60 px-4 py-1 rounded-md text-sm">
                {item.count} pcs
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}