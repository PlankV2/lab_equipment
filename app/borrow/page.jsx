import React from "react";
import Image from "next/image";
import { FlaskConical, Database, Diff, Scale } from "lucide-react";

const Borrow = () => {
  return (
    <div className="flex flex-col w-full h-full">
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
      <div className="flex mt-[50px] px-[10%] items-stretch">
        <div className="flex flex-col">
          <div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px]">
            <FlaskConical />
            <span className="ml-[10px] ">Glassware</span>
          </div>
          <div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px]">
            <Database />
            <span className="ml-[10px] ">Glassware</span>
          </div>
          <div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px]">
            <Diff />
            <span className="ml-[10px] ">Glassware</span>
          </div>
          <div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px]">
            <Scale />
            <span className="ml-[10px] ">Glassware</span>
          </div>
        </div>
        <div className="w-[1px] bg-black ml-[20px]"></div>
        <div className="grid grid-cols-3 w-full gap-4 px-5">
          <div className="w-full flex flex-col">
            <div className="relative w-full h-[250px]">
              <Image
                src="/Images/t_beaker.png"
                className="object-cover"
                fill
                alt="beaker"
              ></Image>
            </div>

            <span>Beaker(500mL)</span>
          </div>
          <div className="h-[50px] bg-black"></div>
          <div className="h-[50px] bg-black"></div>
        </div>
      </div>
    </div>
  );
};

export default Borrow;
