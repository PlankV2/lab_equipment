import Image from "next/image";
import React from "react";

const Inventory = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex ml-[10%] mt-[5%]">
        <span className="text-[40px]">Borrow Equipments</span>
      </div>
      <div className="flex ml-[10%]">
        <span className="text-[12px]">View and search lab equipments</span>
      </div>
      <div className="flex w-full ml-[10%] mt-[5px] pr-[20%] gap-5">
        <div className="flex flex-1 h-[30px] border-1 border-black rounded-lg items-center">
          <span className="text-gray-500 ml-3 text-[15px]">
            Search Items...
          </span>
        </div>
        <div className="flex flex-1 h-[30px] border-1 border-black rounded-lg items-center">
          <span className="ml-3">Category</span>
        </div>
      </div>
      <div className=" border-black border mt-[30px] mx-[10%] flex justify-start gap-[20px] px-[20px] h-[120px]">
        <div className="flex items-center py-[10px] pl-[20px] pr-[20px]">
          <Image
            width={80}
            height={80}
            src="/Images/t_beaker.png"
            className="object-cover mr-[10px]"
          ></Image>
          <span>Beaker(500ml)</span>
        </div>
        <div className="flex-1 justify-start gap-[50px] flex">
          <div className="flex items-center">
            <div className="flex flex-col">
              <span>Total</span>
              <span>Borrowed</span>
              <span>Damaged/Lost</span>
              <span>Available</span>
            </div>
            <div className="flex flex-col ml-[10px]">
              <span>26</span>
              <span>26</span>
              <span>26</span>
              <span>26</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span>Log</span>
            <div className="flex flex-col overflow-y-scroll">
              <span className="text-gray-400">
                2025/6/17 Lank borrowed 2 pcs
              </span>
              <span className="text-gray-400">
                2025/6/17 Lank borrowed 2 pcs
              </span>
              <span className="text-gray-400">
                2025/6/17 Lank borrowed 2 pcs
              </span>
              <span className="text-gray-400">
                2025/6/17 Lank borrowed 2 pcs
              </span>
              <span className="text-gray-400">
                2025/6/17 Lank borrowed 2 pcs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
