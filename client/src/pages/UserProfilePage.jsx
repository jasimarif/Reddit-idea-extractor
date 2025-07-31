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
// Toast import removed as we're using inline messages

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
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });
  const [deleteMessage, setDeleteMessage] = useState({ text: '', type: '' });

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
        setProfileMessage({ text: error.response?.data?.message || "Failed to load profile", type: 'error' });
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

        setProfileMessage({ text: "Profile updated successfully!", type: 'success' });
        setIsEditing(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setProfileMessage({ text: error.response?.data?.message || "Failed to update profile", type: 'error' });
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

    setPasswordMessage({ text: '', type: '' });
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords don't match!", type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ text: "Password must be at least 8 characters long", type: 'error' });
      return;
    }

    try {
      const response = await apiRequest.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data?.success) {
        // Show success message
        setPasswordMessage({ text: "Password updated successfully!", type: 'success' });
        
        // Clear the form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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
      setPasswordMessage({ text: errorMessage, type: 'error' });
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
          setDeleteMessage({ text: "Account deleted successfully", type: 'success' });
          await logout();
        }
      } catch (error) {
        console.error("Account deletion error:", error);
        setDeleteMessage({ 
          text: error.response?.data?.message || "Failed to delete account", 
          type: 'error' 
        });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

        <div className="space-y-5">
          {/* Profile Section */}
          <Card className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-lg">Profile Information</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="flex-1 sm:flex-none justify-center"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="flex-1 sm:flex-none justify-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-lg sm:text-xl font-semibold">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 w-full space-y-3 sm:space-y-4">
                  {profileMessage.text && (
                    <div className={`text-sm mb-2 p-2 rounded-md ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {profileMessage.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      <User className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base">{user.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      <Mail className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base">{user.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      <Calendar className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                      Member Since
                    </label>
                    <p className="text-base">
                      {userData?.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
              <CardTitle className="text-lg">Security</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-5">
              <div>
                <h3 className="font-medium text-sm flex items-center text-gray-700 mb-3">
                  <Lock className="h-4 w-4 mr-2 text-amber-500" />
                  Change Password
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-3 sm:pl-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Button 
                      type="submit" 
                      size="sm"
                      className="w-full sm:w-auto mt-1"
                    >
                      Update Password
                    </Button>
                    {passwordMessage.text && (
                      <div className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordMessage.text}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <Separator className="my-4 sm:my-5" />

              <div>
                <h3 className="font-medium text-sm text-red-500 mb-3">
                  Danger Zone
                </h3>
                <div className="p-3 border border-red-200 rounded-lg bg-red-50/50">
                  <p className="font-medium text-sm mb-1">Delete Account</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  {deleteMessage.text && (
                    <div className={`text-xs mb-3 p-2 rounded-md ${deleteMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {deleteMessage.text}
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto"
                  >
                    Delete My Account
                  </Button>
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
