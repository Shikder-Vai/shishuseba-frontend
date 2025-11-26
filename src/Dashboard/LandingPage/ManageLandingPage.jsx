import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";
import ManageTemplate1 from "./ManageTemplate1";
import ManageDefaultTemplate from "./ManageDefaultTemplate";
import ManageTemplate3 from "./ManageTemplate3";

const ManageLandingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const template = queryParams.get("template");

  const isEditMode = id !== "new";
  const axiosPublic = useAxiosPublic();

  const {
    data,
    isLoading: isLoadingData,
    error: _error,
  } = useQuery({
    queryKey: ["landingPage", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/landing-pages/${id}`);
      return res.data;
    },
    enabled: isEditMode,
  });

  if (isLoadingData) {
    return <Loader />;
  }

  const templateId = isEditMode ? data?.templateId : template;

  switch (templateId) {
    case "template1":
      return <ManageTemplate1 id={id} />;
    case "template3":
      return <ManageTemplate3 id={id} />;
    default:
      return <ManageDefaultTemplate id={id} />;
  }
};

export default ManageLandingPage;
