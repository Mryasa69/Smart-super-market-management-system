import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, User, Heart, Award, ShoppingCart as CartIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("user") || localStorage.getItem("customer");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    nicNumber: "",
  });

  useEffect(() => {
    const employee = localStorage.getItem("user");
    const customer = localStorage.getItem("customer");
    const customerProfile = localStorage.getItem("customerProfile");

    const employeeObj = employee ? JSON.parse(employee) : null;
    const customerObj = customer ? JSON.parse(customer) : null;
    
    let baseName = "";
    let baseEmail = "";
    let basePhone = "";

    if (employeeObj) {
      baseName = `${employeeObj.firstName || ''} ${employeeObj.lastName || ''}`.trim();
      baseEmail = employeeObj.email || "";
      basePhone = employeeObj.phone || "";
    } else if (customerObj) {
      baseName = customerObj.name || "";
      baseEmail = customerObj.email || "";
      basePhone = customerObj.phone || "";
    }

    const profileObj = customerProfile ? JSON.parse(customerProfile) : {};

    const nameToUse = profileObj.name || baseName;
    const nameParts = nameToUse.trim().split(" ").filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    setFormData({
      firstName,
      lastName,
      email: profileObj.email || baseEmail || "",
      phone: profileObj.phone || basePhone || "",
      address: profileObj.address || "",
      nicNumber: profileObj.nicNumber || "",
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const name = `${formData.firstName} ${formData.lastName}`.trim();
    const existingProfile = JSON.parse(localStorage.getItem("customerProfile") || "{}");
    const nextProfile = {
      ...existingProfile,
      name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      nicNumber: formData.nicNumber,
    };
    localStorage.setItem("customerProfile", JSON.stringify(nextProfile));

    const customer = localStorage.getItem("customer");
    if (customer) {
      const customerObj = JSON.parse(customer);
      localStorage.setItem(
        "customer",
        JSON.stringify({
          ...customerObj,
          name,
          email: formData.email,
          phone: formData.phone,
        })
      );
    }

    const employee = localStorage.getItem("user");
    if (employee) {
      const employeeObj = JSON.parse(employee);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...employeeObj,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        })
      );
    }

    navigate("/profile");
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const orderCount = JSON.parse(localStorage.getItem("customerOrders") || "[]").length;
  const loyaltyPoints = JSON.parse(localStorage.getItem("customer") || "{}")?.loyaltyPoints || 0;

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
      <Card className="bg-green-600 text-white p-6 rounded-2xl mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl">{`${formData.firstName} ${formData.lastName}`.trim() || "Customer"}</h2>
            <p className="text-green-100">{formData.email}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-green-700 px-4 py-2 rounded-full">
            {loyaltyPoints} Points
          </div>
          <div className="bg-green-700 bg-opacity-50 px-4 py-2 rounded-full">
            {orderCount} Orders
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
