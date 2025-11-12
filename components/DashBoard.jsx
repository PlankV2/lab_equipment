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
      <div className="flex flex-col border-2 rounded-xl border-gray-300 mt-[100px] p-[15px]">
        <span>Inventory Status</span>
        <div className="flex flex-col">
          <span className="text-[20px] text-orange-700">Out of Inventory</span>
          <div className="flex p-[5px] py-[10px] justify-between bg-rose-300 my-[7px] rounded-lg pr-[20px] pl-[20px] text-[17px]">
            <span>Flask</span>
            <span className="bg-rose-400 px-[30px] rounded-lg rounded-lg">
              0pcs
            </span>
          </div>
          <div className="flex p-[5px] py-[10px] justify-between bg-rose-300 my-[7px] rounded-lg pr-[20px] pl-[20px] text-[17px]">
            <span>Dropper</span>
            <span className="bg-rose-400 px-[30px] rounded-lg">0pcs</span>
          </div>
        </div>
        <div className="flex flex-col mt-[20px]">
          <span className="text-[20px] text-[#E0AC00]">Still in Inventory</span>
          <div className="flex p-[5px] py-[10px] justify-between bg-amber-100 my-[7px] rounded-lg pr-[20px] pl-[20px] text-[17px]">
            <span>Beaker</span>
            <span className="bg-amber-300 px-[30px] rounded-lg">0pcs</span>
          </div>
          <div className="flex p-[5px] py-[10px] justify-between bg-amber-100 my-[7px] rounded-lg pr-[20px] pl-[20px] text-[17px]">
            <span>Lab Coat</span>
            <span className="bg-amber-300 px-[30px] rounded-lg">0pcs</span>
          </div>
          <div className="flex p-[5px] py-[10px] justify-between bg-amber-100 my-[7px] rounded-lg pr-[20px] pl-[20px] text-[17px]">
            <span>Burette</span>
            <span className="bg-amber-300 px-[30px] rounded-lg">0pcs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
