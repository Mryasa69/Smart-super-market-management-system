import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Package, CheckCircle, Clock } from "lucide-react";
import { Card } from "../ui/card";

export function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const orderData: Record<string, any> = {
    "ORD-001": {
      id: "ORD-001",
      date: "March 20, 2026",
      status: "Completed",
      items: [
        {
          name: "Fresh Apples",
          price: 450,
          pricePerKg: 450,
          quantity: 2,
          total: 900,
          image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200",
        },
        {
          name: "Milk 1L",
          price: 280,
          quantity: 3,
          total: 840,
          image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200",
        },
      ],
      deliveryAddress: "123, Main Street, Colombo 07",
      subtotal: 1740,
      deliveryFee: 200,
      total: 1940,
    },
    "ORD-002": {
      id: "ORD-002",
      date: "March 24, 2026",
      status: "Processing",
      items: [
        {
          name: "Premium Rice 5kg",
          price: 720,
          originalPrice: 1200,
          discount: "40% OFF",
          quantity: 1,
          total: 720,
          image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200",
        },
      ],
      deliveryAddress: "123, Main Street, Colombo 07",
      subtotal: 720,
      deliveryFee: 200,
      total: 920,
    },
  };

  const order = orderData[orderId || ""];

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
