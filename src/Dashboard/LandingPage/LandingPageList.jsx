import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";
import { useRole } from "../../hooks/useRole";

const LandingPageList = () => {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const role = useRole();

  const {
    data: landingPages,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["landingPages"],
    queryFn: async () => {
      const res = await axiosPublic.get("/landing-pages");
      return res.data;
    },
  });

  const { mutate: deleteLandingPage } = useMutation({
    mutationFn: async (id) => {
      await axiosPublic.delete(`/landing-pages/${id}`);
    },
    onSuccess: () => {
      Swal.fire("Deleted!", "The landing page has been deleted.", "success");
      queryClient.invalidateQueries(["landingPages"]);
    },
    onError: () => {
      Swal.fire("Error!", "Failed to delete the landing page.", "error");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteLandingPage(id);
      }
    });
  };

  if (isLoading) return <Loader />;
  if (isError) return <div>Error loading landing pages.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Landing Pages</h1>
        {(role === "admin" || role === "moderator") && (
          <div className="dropdown">
            <button
              className="btn"
              popoverTarget="popover-1"
              style={{ anchorName: "--anchor-1" }}
            >
              Create Landing page
            </button>
            <ul
              className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
              popover="auto"
              id="popover-1"
              style={{ positionAnchor: "--anchor-1" }}
            >
              <li>
                <Link
                  to="/dashboard/manage-landing-page/new?template=default"
                  className="  px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus />
                  Template 0 (Default)
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/manage-landing-page/new?template=template1"
                  className="  px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus />
                  Template 1
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/manage-landing-page/new?template=template2"
                  className="  px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus />
                  Template 2
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/manage-landing-page/new?template=template3"
                  className=" px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus />
                  Template 3
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {landingPages.map((page) => (
              <tr key={page._id}>
                <td className="px-6 py-4 whitespace-nowrap">{page.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{page._id}</td>
                <td className="px-6 flex items-center py-4 gap-1 whitespace-nowrap text-sm font-medium">
                  {(role === "admin" || role === "moderator") && (
                    <Link
                      to={`/dashboard/manage-landing-page/${page._id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit />
                    </Link>
                  )}
                  {role === "admin" && (
                    <button
                      onClick={() => handleDelete(page._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LandingPageList;
