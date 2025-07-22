import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Lock,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import apiRequest from "../lib/apiRequest";
import { toast } from "sonner";

const UserProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiRequest.get("/auth/me");
        if (response.data?.user) {
          const { name, email, createdAt } = response.data.user;
          // Ensure createdAt is properly formatted
          const formattedDate = createdAt
            ? new Date(createdAt).toISOString()
            : new Date().toISOString();
          setUserData({ name, email, createdAt: formattedDate });
          setEditedName(name);
          setEditedEmail(email);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error(error.response?.data?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiRequest.get("/auth/me");
      if (response.data?.user) {
        const { name, email, createdAt } = response.data.user;
        // Ensure createdAt is properly formatted
        const formattedDate = createdAt
          ? new Date(createdAt).toISOString()
          : new Date().toISOString();
        setUserData({ name, email, createdAt: formattedDate });
        setEditedName(name);
        setEditedEmail(email);
        return { name, email, createdAt: formattedDate };
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
      throw error;
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        await fetchUserData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    try {
      const response = await apiRequest.put("/auth/me", {
        name: editedName,
        email: editedEmail,
      });

      if (response.data?.user) {
        // Refresh user data from server to ensure consistency
        const updatedUser = await fetchUserData();

        // Update the auth context with fresh data
        setUser((prev) => ({
          ...prev,
          name: updatedUser.name,
          email: updatedUser.email,
          updatedAt: new Date().toISOString(),
        }));

        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || "");
    setEditedEmail(user?.email || "");
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await apiRequest.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data?.success) {
        // Show success message
        toast.success("Password updated successfully!");

        // Clear the form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Log any potential issues with the toast
        console.log("Password updated successfully, showing toast");
      } else {
        throw new Error("Failed to update password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      // Show more detailed error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update password. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
      )
    ) {
      try {
        const response = await apiRequest.delete("/auth/me");
        if (response.data?.success) {
          toast.success("Account deleted successfully");
          await logout();
        }
      } catch (error) {
        console.error("Account deletion error:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete account"
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load profile information. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <Card className="rounded-2xl shadow-lg border-0 overflow-hidden bg-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profile Information</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-semibold">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-transparent"
                      />
                    ) : (
                      <p className="text-lg">{user.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-transparent"
                      />
                    ) : (
                      <p className="text-lg">{user.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Member Since
                    </label>
                    <p className="text-lg">
                      {userData?.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="rounded-2xl shadow-lg border-0 overflow-hidden bg-white">
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-amber-500" />
                  Change Password
                </h3>
                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-4 pl-7"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-transparent"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-transparent"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-transparent"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <Button type="submit" className="mt-2">
                    Update Password
                  </Button>
                </form>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-medium text-red-500">Danger Zone</h3>
                <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                  <div className="space-y-2">
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      className="mt-2"
                      onClick={handleDeleteAccount}
                    >
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
