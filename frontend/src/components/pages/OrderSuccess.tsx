import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart as CartIcon, PackageCheck, ArrowRight } from "lucide-react";
import { Card } from "../ui/card";
import { apiService } from "../../services/api";

export function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isFinalizing, setIsFinalizing] = useState(true);
  const [message, setMessage] = useState("Finalizing your payment...");

  useEffect(() => {
    const finalizePayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setIsFinalizing(false);
        setMessage("Your order was placed successfully.");
        return;
      }

      try {
        const response = await apiService.verifyStripeOrder(sessionId);
        if (response.success && response.data) {
          localStorage.removeItem("cart");
          localStorage.setItem("customerOrders", JSON.stringify([response.data, ...JSON.parse(localStorage.getItem("customerOrders") || "[]").filter((order: any) => {
            const existingId = order.orderNumber || order.id || order._id;
            return existingId !== response.data.orderNumber;
          })]));

          try {
            await apiService.saveCart([]);
          } catch (error) {
            console.error("[OrderSuccess] Failed to clear cart in DB:", error);
          }

          setMessage("Payment completed successfully.");
        } else {
          setMessage(response.message || "Payment confirmation is still processing.");
        }
      } catch (error) {
        console.error("[OrderSuccess] Stripe verification failed:", error);
        setMessage("Payment was received, but confirmation is still syncing.");
      } finally {
        setIsFinalizing(false);
      }
    };

    finalizePayment();
  }, [searchParams]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="border-b pb-4 mb-6">
        <div className="flex justify-between items-end px-6 py-8 border-b text-sm text-gray-600 w-full max-w-7xl mx-auto">
      
     
  
        {/* Left: Continue Shopping */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-green-600"
        >
          ← Continue Shopping
        </button>

        {/* Center: Shopping Cart */}
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-green-600"
        >
          🛒 Shopping Cart
        </button>

        {/* Right: My Account */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-green-600"
        >
          My Account
        </button>
      </div>
      </div>

      <div className="flex items-center justify-center py-12">
        <Card className="max-w-lg w-full bg-green-50 border-green-200 p-12">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="w-full h-full flex items-center justify-center">
                <PackageCheck className="w-20 h-20 text-green-600" strokeWidth={1.5} />
              </div>
              <div className="absolute top-0 right-0">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-2xl mb-3">{isFinalizing ? "Securing your order..." : "Order Placed Successfully!"}</h2>
            <p className="text-gray-700 mb-6">
              {message}
            </p>

            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
            >
              View Order Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
