import React from "react";
import {
  Package,
  TriangleAlert,
  ToolCase,
  CircleArrowUp,
  FlaskConical,
} from "lucide-react";
import Link from "next/link";

const DashBoard = () => {
  return (
    <div className="flex flex-col w-full p-10 relative">
      <span className="text-[50px] mb-10">Dashboard</span>
      <div className="flex justify-between">
        <div className="flex flex-col w-[22%] border-gray-300 border-2 rounded-xl p-6 justify-between gap-5">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Items</span>
            <Package size={20} />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[25px]">10</span>
            <span className="text-[15px] text-gray-400">
              Active Inventory Status
            </span>
          </div>
        </div>
        <div className="flex flex-col w-[22%] border-gray-300 border-2 rounded-xl p-6 justify-between gap-5">
          <div className="flex justify-between items-center">
            <span className="font-bold">Remaining Items</span>
            <ToolCase size={20} />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[25px]">10</span>
            <span className="text-[15px] text-gray-400">
              Active Inventory Status
            </span>
          </div>
        </div>
        <div className="flex flex-col w-[22%] border-gray-300 border-2 rounded-xl p-6 justify-between gap-5">
          <div className="flex justify-between items-center">
            <span className="font-bold">Taken Items</span>
            <CircleArrowUp size={20} />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[25px]">10</span>
            <span className="text-[15px] text-gray-400">
              Active Inventory Status
            </span>
          </div>
        </div>
        <div className="flex flex-col w-[22%] border-gray-300 border-2 rounded-xl p-6 justify-between gap-5">
          <div className="flex justify-between items-center">
            <span className="font-bold">Damaged/Missing Items</span>
            <TriangleAlert size={20} />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[25px]">10</span>
            <span className="text-[15px] text-gray-400">
              Active Inventory Status
            </span>
          </div>
        </div>
      </div>
      <div className="p-[15px] w-full mt-[25px] border-gray-300 h-[300px] border-[2px] rounded-xl">
        <div>inventory status</div>
        <div>
          <div className="text-red-300">Out of inventory</div>
          <div>
            <div className="bg-red-300 w-full">flsk</div>
            <div>dropper</div>
          </div>
        </div>
        <div>
          <div>still of invenbtory</div>
          <div>
            <div>beaker</div>
            <div>labv coat</div>
            <div>bretet</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
