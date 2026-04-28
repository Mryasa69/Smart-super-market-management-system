import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, User, Heart, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const userData = {
    name: "John Doe",
    email: "john.doe@email.com",
    points: 2450,
    orders: 2,
    phone: "+94 77 123 4567",
    address: "123, Main Street, Colombo 07",
    nicNumber: "199012345678",
  };

  const rewards = [
    {
      id: 1,
      title: "Rs. 100 Voucher",
      points: 1000,
      description: "Get Rs. 100 off on your next purchase",
      available: true,
    },
    {
      id: 2,
      title: "Rs. 250 Voucher",
      points: 2500,
      description: "Get Rs. 250 off on your next purchase",
      available: false,
    },
    {
      id: 3,
      title: "Rs. 500 Voucher",
      points: 5000,
      description: "Get Rs. 500 off on your next purchase",
      available: false,
    },
    {
      id: 4,
      title: "Free Delivery",
      points: 500,
      description: "Get free delivery on your next order",
      available: true,
    },
  ];

  const loyaltySteps = [
    {
      step: 1,
      title: "Earn Points",
      description: "Earn 1 point for every Rs. 100 spent",
    },
    {
      step: 2,
      title: "Collect Points",
      description: "Accumulate points with every purchase",
    },
    {
      step: 3,
      title: "Redeem Rewards",
      description: "Exchange 1000 points for Rs. 100 discount voucher",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
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


        <div className="flex items-center gap-4">
          <Link to="/cart"  className="flex items-center gap-2 text-green-600">
            Cart
          </Link>
          <Link to="/orders"  className="flex items-center gap-2 text-green-600">
            Orders
          </Link>
        </div>
      </div>

      <h1 className="text-2xl mb-6">My Profile</h1>

      <Card className="bg-green-600 text-white p-6 rounded-2xl mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl">{userData.name}</h2>
            <p className="text-green-100">{userData.email}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-green-700 px-4 py-2 rounded-full">
            {userData.points} Points
          </div>
          <div className="bg-green-700 bg-opacity-50 px-4 py-2 rounded-full">
            {userData.orders} Orders
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white border rounded-xl p-1 mb-6">
          <TabsTrigger
            value="profile"
            className="flex-1 flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile Details
          </TabsTrigger>
          <TabsTrigger
            value="wishlist"
            className="flex-1 flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger
            value="loyalty"
            className="flex-1 flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            LoyaltyPoints
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg">Personal Information</h3>
              <Link to="/profile/edit">
                <Button variant="outline"  className="text-green-600 border-green-600 hover:bg-green-50">Edit Profile</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">First Name</p>
                <p className="font-medium">John</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Name</p>
                <p className="font-medium">Doe</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-medium">{userData.phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-medium">{userData.address}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">NIC Number</p>
                <p className="font-medium">{userData.nicNumber}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <Card className="p-6">
            <h3 className="text-lg mb-4">My Wishlist</h3>
            <div className="text-center py-12 text-gray-500">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Your wishlist is empty</p>
              <p className="text-sm mt-2">
                Start adding items you love to your wishlist!
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl mb-1">{userData.points} Points</h3>
                <p className="text-gray-600">Your Total Loyalty Points</p>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress to next reward</span>
                  <span>550 points to go</span>
                </div>
                <Progress value={60} className="h-3" />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg mb-4">How Loyalty Points Work</h3>
              <div className="space-y-4">
                {loyaltySteps.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg mb-4">Available Rewards</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {rewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className="p-4 border-2 border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{reward.title}</h4>
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                        {reward.points}pts
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {reward.description}
                    </p>
                    <Button
                      className={
                        reward.available
                          ? "w-full bg-green-600 hover:bg-green-700"
                          : "w-full"
                      }
                      variant={reward.available ? "default" : "secondary"}
                      disabled={!reward.available}
                    >
                      {reward.available ? "Redeem Now" : "Need More points"}
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
