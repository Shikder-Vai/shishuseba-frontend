import Navbar from "../../Shared/Navbar/Navbar";
import { Outlet } from "react-router-dom";

const OfferLayout = () => {
  return (
    <div className="">
      <Navbar></Navbar>
      <div className="md:pt-[88px] pt-[100px]">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default OfferLayout;
