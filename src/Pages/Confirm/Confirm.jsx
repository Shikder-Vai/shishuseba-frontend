import { useLocation } from "react-router-dom";
import { User, Phone, MapPin } from "lucide-react";
import { pushPurchase } from "../../services/DataLayerService";
import { useEffect, useRef } from "react";

const Confirm = () => {
  const location = useLocation();
  const hasFiredPurchase = useRef(false);

  const {
    orderId,
    items = [],
    subtotal = 0,
    shippingCost = 0,
    total = 0,
    user = {},
  } = location.state || {};

  // --- GTM TRACKING: PURCHASE ---
  useEffect(() => {
    if (orderId && !hasFiredPurchase.current) {
      const orderDetailsForGTM = {
        _id: orderId,
        totalPrice: total,
        taxPrice: 0,
        shippingPrice: shippingCost,
        products: items.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        userData: user,
      };

      pushPurchase(orderDetailsForGTM);
      hasFiredPurchase.current = true;
    }
  }, [orderId, items, total, shippingCost, user]);
  // if have no order then show empty div
  if (!orderId) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-gray-base">
            No order information found.
          </h1>
          <p className="text-brand-gray-base mt-2">
            Please complete the checkout process to see your confirmation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-soft border border-brand-gray-light">
        <div className="bg-brand-teal-base items-center text-center p-6">
          <h1 className="text-2xl font-bold text-white">Order Confirmation</h1>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2 items-center text-center">
            <svg
              className="w-16 h-16 mx-auto text-brand-teal-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h2 className="text-xl font-semibold text-brand-gray-base">
              Thank you for your order!
            </h2>
            <p className="text-brand-gray-base">
              We've received your order and it's now being processed.
            </p>
          </div>

          <div className="bg-brand-cream p-4 rounded-lg border border-brand-orange-light">
            <p className="font-medium text-brand-gray-base">Your Order ID:</p>
            <p className="text-2xl font-bold text-brand-teal-500 mt-2">
              {orderId}
            </p>
            <p className="text-sm text-brand-gray-base mt-2">
              Please keep this reference for tracking your order
            </p>
          </div>
          <div className="shadow-md shadow-gray-200">
            <div className="border border-brand-gray-light rounded-t-lg p-4">
              <h3 className="text-lg font-semibold  text-brand-gray-base mb-4">
                Order Details
              </h3>
              <div className="space-y-3 text-brand-gray-base">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-brand-teal-base" />
                  <span>{user.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-teal-base" />
                  <span>{user.mobile}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-teal-base mt-1 flex-shrink-0" />
                  <span>
                    {user.address}, {user.district}, Bangladesh
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-brand-gray-light rounded-b-lg p-4">
              <h3 className="text-lg font-semibold text-brand-gray-base mb-4">
                Order Summary
              </h3>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id || item._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-md object-cover mr-4"
                      />
                      <div>
                        <p className="font-semibold text-brand-gray-base">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-brand-gray-base">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-brand-gray-light space-y-2">
                <div className="flex justify-between text-brand-gray-base">
                  <p>Subtotal</p>
                  <p>৳{subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-brand-gray-base">
                  <p>Shipping</p>
                  <p>৳{shippingCost.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-brand-gray-base font-bold text-lg">
                  <p>Total</p>
                  <p>৳{total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-teal-50 p-4 rounded-lg border border-brand-teal-200 text-center">
            <h3 className="font-bold text-brand-teal-700 text-lg mb-2">
              🎁 Special Offer!
            </h3>
            <p className="text-brand-gray-base mb-3">
              Contact us now to claim your exclusive gift with this order!
            </p>
            <a
              href={`https://wa.me/8801957810247?text=Hi! I just placed order #${orderId} and want to claim my special gift.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Claim Gift via WhatsApp
            </a>
          </div>

          <div className="pt-4">
            <img
              className="h-48 mx-auto animate-fade-in"
              src="https://engaze.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fhero-section-delivery-van.9384bb62.gif&w=1200&q=75"
              alt="Delivery in progress"
            />
          </div>

          <div className="pt-4 border-t border-brand-gray-light">
            <p className="text-brand-gray-base">
              Need help?{" "}
              <a href="#" className="text-brand-teal-base hover:underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
