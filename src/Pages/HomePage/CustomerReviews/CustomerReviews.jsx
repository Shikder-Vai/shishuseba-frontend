import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import useReviews from "../../../hooks/useReviews";
import Loader from "../../../components/Loader";
import SectionTitle from "../../../components/SectionTitle";

const CustomerReviews = () => {
  const { reviews, loadingReviews } = useReviews();

  if (loadingReviews) {
    return <Loader />;
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const chunkedReviews = [];
  for (let i = 0; i < reviews.length; i += 3) {
    chunkedReviews.push(reviews.slice(i, i + 3));
  }

  return (
    <div className="py-8 mb-4 max-w-6xl mx-auto">
      <SectionTitle title={"Our Happy Customers"}></SectionTitle>
      <div className=" px-4">
        <Carousel
          autoPlay
          interval={5000}
          infiniteLoop
          showArrows={true}
          showStatus={false}
          showIndicators={false}
          showThumbs={false}
        >
          {chunkedReviews.map((chunk, index) => (
            <div key={index} className="grid grid-cols-3 gap-4">
              {chunk.map((review) => (
                <div key={review._id} className="p-2">
                  <img
                    src={review.imageUrl}
                    alt="Customer Review"
                    className="rounded-lg shadow-lg object-cover h-64 w-full"
                  />
                </div>
              ))}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default CustomerReviews;
