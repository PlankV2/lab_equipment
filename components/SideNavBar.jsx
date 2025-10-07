"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, ClipboardList, AlertTriangle, LogIn } from "lucide-react";
import Image from "next/image";

export default function SideNavBar() {
  return (
    <div className="p-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default" className="bg-black text-white">
            <Menu />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[300px] p-8 flex flex-col pr-[40px]"
        >
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="font-bold text-[21px]">Inventory Manager</h1>
            <div className="flex">
              <span className="text-[15px] leading-4 text-gray-400">
                Hobby School Lab Equipment Inventory
              </span>
              <Image
                src="/images/HobbyLogo.png"
                alt="logo"
                width={50}
                height={20}
              />
            </div>
          </div>

          <nav className="flex flex-col gap-4 flex-grow">
            <button className="flex items-center gap-2 font-medium">
              <Home size={18} /> Dashboard
            </button>
            <button className="flex items-center gap-2 font-medium">
              <ClipboardList size={18} /> Inventory
            </button>
            <button className="flex items-center gap-2 font-medium">
              <AlertTriangle size={18} />
              <div className="flex flex-col">
                <span>Report missing/</span>
                <span>Damaged items</span>
              </div>
            </button>
          </nav>

          <div className="mt-auto">
            <button className="flex items-center justify-center gap-2 bg-black text-white rounded-md py-2 w-full">
              <LogIn size={18} /> Login
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
