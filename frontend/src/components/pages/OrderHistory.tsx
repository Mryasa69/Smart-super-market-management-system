import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle, Clock } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { apiService, CustomerOrder } from "../../services/api";
import { actionButtonClass } from "../../lib/actionButton";

export function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      const localOrders = JSON.parse(localStorage.getItem("customerOrders") || "[]");
      const token = apiService.getStoredToken();

      if (!token) {
        setOrders(localOrders);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.getOrders();
        if (response.success && response.data) {
          setOrders(response.data);
          setError("");
        } else {
          setOrders(localOrders);
          setError(response.message || "Showing locally cached orders.");
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        setOrders(localOrders);
        setError("Showing locally cached orders.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const formatOrderDate = (order: CustomerOrder) => {
    const rawDate = order.date || order.createdAt;
    if (!rawDate) return "Recently";
    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return String(rawDate);
    }
    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const orderId = (order: CustomerOrder) => order.id || order.orderNumber || order._id;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center gap-2 ${actionButtonClass}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          <h1 >My Orders</h1>
        </div>
        <Link to="/profile" className={actionButtonClass}>
          My Profile
        </Link>
      </div>

      <h2 className="text-xl mb-6">Order History</h2>

      {error && <p className="mb-4 text-sm text-amber-700">{error}</p>}

      {isLoading ? (
        <div className="py-12 text-center text-gray-600">Loading orders...</div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          No orders found yet. Place an order to see it here.
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={orderId(order)} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg mb-1">Order {orderId(order)}</h3>
                  <p className="text-sm text-gray-600">{formatOrderDate(order)}</p>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    order.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status === "Completed" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  {order.status}
                </div>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {order.items.map((item, index) => (
                  <img
                    key={`${orderId(order)}-${index}`}
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{order.itemCount} items</p>
                  <p className="font-medium">Total: Rs. {order.total.toLocaleString()}</p>
                </div>
                <Link to={`/orders/${orderId(order)}`}>
                  <Button className={actionButtonClass}>View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
