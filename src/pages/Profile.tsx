import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Edit, Save, Coins, Camera, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { credits } = useCredits();
  const [isEditing, setIsEditing]   = useState(false);
  const [editedName, setEditedName] = useState(user?.name ?? "");
  const [profilePicture, setProfilePicture] = useState<string | null>(
    user?.email ? localStorage.getItem(`profilePicture_${user.email}`) : null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProfilePicture(reader.result);
        localStorage.setItem(`profilePicture_${user.email}`, reader.result);
        /* Notify sidebar to re-load the picture */
        window.dispatchEvent(new Event("profilePicUpdated"));
        toast.success("Profile picture updated!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!editedName.trim()) { toast.error("Name cannot be empty."); return; }
    updateUser({ name: editedName.trim() });
    setIsEditing(false);
    toast.success("Profile updated!");
  };

  const handleCancel = () => {
    setEditedName(user?.name ?? "");
    setIsEditing(false);
  };

  if (!user) return (
    <div className="flex justify-center items-center h-full">
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  );

  return (
    <div className="min-h-full p-6 md:p-8 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage your personal information</p>
      </div>

      {/* Avatar card */}
      <Card className="animate-fade-in-up delay-100 border-gray-100 dark:border-gray-800 dark:bg-gray-800/60 shadow-none">
        <CardContent className="pt-6 pb-5 flex flex-col items-center gap-3">
          {/* Avatar with upload overlay */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 shadow-sm">
              {profilePicture
                ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-[#3F3D56] to-[#007AFF] flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{user.name?.charAt(0).toUpperCase() ?? "U"}</span>
                  </div>
              }
            </div>
            <label
              htmlFor="profile-pic-input"
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-5 h-5 text-white" />
            </label>
            <input
              id="profile-pic-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
          </div>
          <label
            htmlFor="profile-pic-input"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Change photo
          </label>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="animate-fade-in-up delay-200 border-gray-100 dark:border-gray-800 dark:bg-gray-800/60 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">User Information</CardTitle>
            </div>
            {!isEditing
              ? <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}
                  className="h-7 text-xs border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Edit className="w-3 h-3 mr-1.5" /> Edit
                </Button>
              : <div className="flex gap-1.5">
                  <Button size="sm" onClick={handleSave}
                    className="h-7 text-xs bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white">
                    <Save className="w-3 h-3 mr-1.5" /> Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}
                    className="h-7 text-xs border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    Cancel
                  </Button>
                </div>
            }
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <User className="w-3 h-3" /> Full Name
            </label>
            {isEditing
              ? <Input value={editedName} onChange={(e) => setEditedName(e.target.value)}
                  className="h-9 text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-blue-500" />
              : <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name || "—"}</p>
            }
          </div>
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> Email Address
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-600 italic">Email cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      {/* Credits card */}
      <Card className="animate-fade-in-up delay-300 border-gray-100 dark:border-gray-800 dark:bg-gray-800/60 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Credits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">Credits Remaining</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{credits}</p>
            </div>
            <Coins className="w-10 h-10 text-amber-400/40" />
          </div>
          <button
            onClick={() => navigate("/pricing")}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl py-2.5 transition-colors"
          >
            Get more credits <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
