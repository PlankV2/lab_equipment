import Image from "next/image";
import SideNavBar from "@/components/SideNavBar";
import DashBoard from "@/components/DashBoard";

export default function Home() {
  return (
    <div className="flex">
      <SideNavBar />
      <DashBoard />
    </div>
  );
}
