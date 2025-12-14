"use client";

import React from "react";
import Image from "next/image";
import { FlaskConical, Database, Diff, Scale } from "lucide-react";
import { queries } from "@/gql/queries";
import { SquarePlus, SquareMinus } from "lucide-react";
import { queries } from "@/gql/queries";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";

{
	/*import { useBorrow } from "../context/BorrowContext";*/
}

const Borrow = () => {
	const { data, loading, error } = useQuery(GET_USERS);
	console.log(data);
	{
		/*}
  const { addToBorrowList } = useBorrow();
  const [items, setItems] = useState([]);

  useEffect(() => {
    getEquipment().then(setItems);
  }, []);
*/
	}
	return (
		<>
			<div className="flex flex-col w-full h-full">
				<div className="flex ml-[10%] mt-[5%]">
					<span className="text-[40px]">Borrow Equipments</span>
				</div>
				<div className="flex ml-[10%]">
					<span className="text-[12px]">
						View and search lab equipments
					</span>
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
							<span className="ml-[10px] ">Plasticware</span>
						</div>
						<div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px]">
							<Diff />
							<span className="ml-[10px] ">Lab Stands</span>
						</div>
						<div className="flex border border-black px-[25px] py-[10px] rounded-lg justify-center mt-[10px] items-center`">
							<Scale />
							<span className="ml-[10px] ">Balances & Scale</span>
						</div>
					</div>
					<div className="w-[1px] bg-black ml-[20px]"></div>
					<div className="grid grid-cols-3 w-full gap-4 px-5">
						{data.map((item) => (
							<div className="w-full flex flex-col bg-gray-100 rounded-xl overflow-hidden">
								<div className="relative w-full h-[300px] border-t rounded-xl">
									<Image
										src="item.url"
										className="object-cover"
										fill
										alt="beaker"
									></Image>
								</div>
								<div className="flex flex-col px-[15px] mt-[3px]">
									<span>item.name</span>
									<div className="bg-amber-400 w-fit px-[15px] py-[2px] rounded-lg mt-[5px]">
										<span>{item.totalQuantity} left</span>
									</div>
									<div className="h-[30px] bg-black text-white mt-[14px] mb-[10px] flex justify-center items-center rounded-xl">
										<span>Add Item</span>
									</div>
								</div>
							</div>
						))}

						<div className="w-full flex flex-col bg-gray-100 rounded-xl overflow-hidden">
							<div className="relative w-full h-[300px] border-t rounded-xl">
								<Image
									src="/Images/t_beaker.png"
									className="object-cover"
									fill
									alt="beaker"
								></Image>
							</div>
							<div className="flex flex-col px-[15px] mt-[3px]">
								<span>Beaker(500mL)</span>
								<div className="bg-amber-400 w-fit px-[15px] py-[2px] rounded-lg mt-[5px]">
									<span>2pc(s) left</span>
								</div>
								<div className="h-[30px] bg-black text-white mt-[14px] mb-[10px] flex justify-center items-center rounded-xl">
									<span>Add Item</span>
								</div>
							</div>
						</div>
						<div className="w-full flex flex-col bg-gray-100 rounded-xl overflow-hidden">
							<div className="relative w-full h-[300px] border-t rounded-xl">
								<Image
									src="/Images/t_beaker.png"
									className="object-cover"
									fill
									alt="beaker"
								></Image>
							</div>
							<div className="flex flex-col px-[15px] mt-[3px]">
								<span>Beaker(500mL)</span>
								<div className="bg-amber-400 w-fit px-[15px] py-[2px] rounded-lg mt-[5px]">
									<span>2pc(s) left</span>
								</div>
								<div className="h-[30px] bg-black text-white mt-[14px] mb-[10px] flex justify-center items-center rounded-xl">
									<span>Add Item</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="h-[300px] w-full"></div>
			</div>
			<div className="h-[180px] fixed border-4 border-gray-300 rounded-lg bottom-0 right-[10%] left-[15%]"></div>
		</>
	);
};

export default Borrow;
