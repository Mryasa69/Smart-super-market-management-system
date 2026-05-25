import { Link, useNavigate } from "react-router";
import { ArrowLeft, Package, CheckCircle, Clock } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useMemo } from "react";

export function OrderHistory() {
  const navigate = useNavigate();

  const orders = useMemo(() => JSON.parse(localStorage.getItem("customerOrders") || "[]"), []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-black-600 hover:text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          <h1 >My Orders</h1>
        </div>
        <Link to="/profile" className="text-black-600 hover:text-gray-600">
          My Profile
        </Link>
      </div>

      <h2 className="text-xl mb-6">Order History</h2>

      <div className="space-y-4">
        {orders.length === 0 && (
          <Card className="p-6 text-center text-gray-600">
            No orders yet. Place your first order from the cart.
          </Card>
        )}

        {orders.map((order: any) => (
          <Card key={order.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg mb-1">Order {order.id}</h3>
                <p className="text-sm text-gray-600">{order.date}</p>
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

            <div className="flex gap-2 mb-4">
              {order.items.map((item, index) => (
                <img
                  key={index}
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {order.itemCount} items
                </p>
                <p className="font-medium">
                  Total: Rs. {order.total.toLocaleString()}
                </p>
              </div>
              <Link to={`/orders/${order.id}`}>
                <Button variant="outline" className="hover:text-gray-600">View Details</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
