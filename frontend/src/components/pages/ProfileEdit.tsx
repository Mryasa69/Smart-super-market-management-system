import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, User, Heart, Award, ShoppingCart as CartIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function ProfileEdit() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+94 77 123 4567",
    address: "123, Main Street, Colombo 07",
    nicNumber: "199012345678",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    navigate("/profile");
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const userData = {
    name: "John Doe",
    email: "john.doe@email.com",
    points: 2450,
    orders: 2,
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-center gap-4 mb-6 relative">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 absolute left-0"
        >
          <ArrowLeft className="w-5 h-5" />
          Continue Shopping
        </button>
        <div className="flex items-center gap-2">
          <CartIcon className="w-6 h-6 text-gray-600" />
          <h1 className="text-xl">Shopping Cart</h1>
        </div>
        <Link
          to="/orders"
          className="text-gray-600 hover:text-gray-900 absolute right-0"
        >
          Cart Orders
        </Link>
      </div>

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

      <div className="bg-white border rounded-xl p-1 mb-6 flex">
        <Link
          to="/profile"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white"
        >
          <User className="w-4 h-4" />
          Profile Details
        </Link>
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg">
          <Heart className="w-4 h-4" />
          Wishlist
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg">
          <Award className="w-4 h-4" />
          LoyaltyPoints
        </button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg">Personal Information</h3>
          <Button variant="outline"  className="text-green-600 border-green-600 hover:bg-green-50" onClick={handleCancel}>
            Cancel
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="nicNumber">NIC Number</Label>
            <Input
              id="nicNumber"
              name="nicNumber"
              value={formData.nicNumber}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
