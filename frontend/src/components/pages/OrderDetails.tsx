import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Package, CheckCircle, Clock } from "lucide-react";
import { Card } from "../ui/card";

export function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const orders = JSON.parse(localStorage.getItem("customerOrders") || "[]");
  const order = orders.find((o: any) => o.id === orderId);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-black-600 hover:text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          <h1 >My Orders</h1>
        </div>
        <Link to="/profile" className="text-black-300 hover:text-gray-600">
          My Profile
        </Link>
      </div>

      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-2 text-green-600 hover:text-green-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </button>

      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl mb-1">Order {order.id}</h2>
            <p className="text-gray-600">Placed on {order.date}</p>
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

        <div className="mb-6">
          <h3 className="font-medium mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{item.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                      Rs. {item.price.toLocaleString()}
                      {item.pricePerKg && "/kg"}
                    </p>
                    {item.originalPrice && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          Rs. {item.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded">
                          {item.discount}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Rs. {item.total.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Delivery Address</h3>
          <p className="text-gray-600">{order.deliveryAddress}</p>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>Rs. {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>Rs. {order.deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-2 border-t">
            <span>Total</span>
            <span>Rs. {order.total.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
