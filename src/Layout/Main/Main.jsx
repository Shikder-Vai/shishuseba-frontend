import Navbar from "../../Shared/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../../Shared/Footer/Footer";

const Main = () => {
  return (
    <div className="">
      <Navbar></Navbar>
      <div className="md:pt-[98px] pt-[110px]">
        <Outlet></Outlet>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Main;
