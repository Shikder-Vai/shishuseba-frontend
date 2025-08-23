import { useEffect, useRef } from "react";
import Banner from "../Banner/Banner";
import Featured from "../../Featured/Featured";
import OurGallery from "../../OurGallery/OurGallery";
import { useLocation } from "react-router-dom";
import { pushPageView } from "../../../services/DataLayerService";

const Home = () => {
  const location = useLocation();
  const hasFiredViewHome = useRef(false);

  useEffect(() => {
    if (!hasFiredViewHome.current) {
      pushPageView(location.pathname, document.title);
      hasFiredViewHome.current = true;
    }
  }, [location]);

  return (
    <div>
      <Banner></Banner>
      <Featured></Featured>
      <OurGallery></OurGallery>
    </div>
  );
};

export default Home;
