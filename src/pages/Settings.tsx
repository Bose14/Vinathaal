import { useState, useEffect } from "react";
import { User, Mail, Lock, Bell, Save, Shield, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

const NOTIF_STORAGE_KEY = "vinathaal_notif_prefs";

function loadNotifPrefs() {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { emailUpdates: boolean; paperAlerts: boolean; creditAlerts: boolean };
  } catch { /* ignore */ }
  return { emailUpdates: true, paperAlerts: true, creditAlerts: false };
}

const Settings = () => {
  const { user, updateUser } = useAuth();

  const [name, setName]                   = useState(user?.name ?? "");
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPwd, setSavingPwd]         = useState(false);
  const [resetSent, setResetSent]         = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(
    user?.email ? localStorage.getItem(`profilePicture_${user.email}`) : null
  );

  const prefs = loadNotifPrefs();
  const [emailUpdates, setEmailUpdates] = useState(prefs.emailUpdates);
  const [paperAlerts, setPaperAlerts]   = useState(prefs.paperAlerts);
  const [creditAlerts, setCreditAlerts] = useState(prefs.creditAlerts);

  useEffect(() => {
    if (user?.email) {
      setProfilePicture(localStorage.getItem(`profilePicture_${user.email}`));
    }
  }, [user?.email]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProfilePicture(reader.result);
        localStorage.setItem(`profilePicture_${user.email}`, reader.result);
        window.dispatchEvent(new Event("profilePicUpdated"));
        toast.success("Profile picture updated!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAccount = async () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setSavingAccount(true);
    try { updateUser({ name: name.trim() }); toast.success("Account information saved"); }
    finally { setSavingAccount(false); }
  };

  const handleSendResetLink = async () => {
    setSavingPwd(true);
    try {
      await api.auth.forgotPassword(user?.email ?? "");
      setResetSent(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    } finally { setSavingPwd(false); }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify({ emailUpdates, paperAlerts, creditAlerts }));
    toast.success("Notification preferences saved");
  };

  const userInitial = user?.name?.trim()[0]?.toUpperCase() ?? "U";
  const inputCls = "h-9 text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-blue-500";

  return (
    <div className="min-h-full p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="account" className="animate-fade-in-up delay-100">
        <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 h-9">
          <TabsTrigger value="account"
            className="rounded-lg text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm dark:text-gray-400 dark:data-[state=active]:text-white">
            Account
          </TabsTrigger>
          <TabsTrigger value="security"
            className="rounded-lg text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm dark:text-gray-400 dark:data-[state=active]:text-white">
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications"
            className="rounded-lg text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm dark:text-gray-400 dark:data-[state=active]:text-white">
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Account tab */}
        <TabsContent value="account" className="space-y-5">
          <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Account Information</CardTitle>
                  <CardDescription className="text-xs dark:text-gray-500">Update your personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Avatar with upload */}
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    {profilePicture
                      ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-[#3F3D56] to-[#007AFF] flex items-center justify-center">
                          <span className="text-white text-xl font-bold">{userInitial}</span>
                        </div>
                    }
                  </div>
                  <label
                    htmlFor="settings-pic-input"
                    className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </label>
                  <input
                    id="settings-pic-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{user?.email}</p>
                  <label htmlFor="settings-pic-input" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mt-0.5 block">
                    Change photo
                  </label>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700" />

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Enter your full name" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
                </Label>
                <div className="relative">
                  <Input value={user?.email ?? ""} readOnly className={`${inputCls} bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-500 cursor-not-allowed`} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 px-1.5 py-0.5 rounded">
                    read-only
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-600">Email address cannot be changed</p>
              </div>

              <Button onClick={handleSaveAccount} disabled={savingAccount}
                className="h-9 px-5 bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white text-xs font-medium">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {savingAccount ? "Saving…" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security tab */}
        <TabsContent value="security" className="space-y-5">
          <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Change Password</CardTitle>
                  <CardDescription className="text-xs dark:text-gray-500">
                    We'll send a secure reset link to <strong className="dark:text-gray-300">{user?.email}</strong>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resetSent ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-1">
                    <Lock className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Reset link sent!</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                    Check your inbox at <strong className="dark:text-gray-300">{user?.email}</strong>. Click the link to set a new password.
                  </p>
                  <button onClick={() => setResetSent(false)} className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline">Send again</button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    For security, we don't let you change your password directly here. Instead, we'll email you a one-time reset link.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/40 rounded-xl px-4 py-3">
                    <Mail className="w-4 h-4 shrink-0" />
                    Reset link will be sent to: <strong className="text-gray-700 dark:text-gray-300">{user?.email}</strong>
                  </div>
                  <Button onClick={handleSendResetLink} disabled={savingPwd}
                    className="h-9 px-5 bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white text-xs font-medium">
                    <Lock className="w-3.5 h-3.5 mr-1.5" />
                    {savingPwd ? "Sending…" : "Send Password Reset Link"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications tab */}
        <TabsContent value="notifications" className="space-y-5">
          <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Email Preferences</CardTitle>
                  <CardDescription className="text-xs dark:text-gray-500">Choose what emails you'd like to receive</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { id: "email-updates", label: "Product Updates",           desc: "New features and announcements",          value: emailUpdates, onChange: setEmailUpdates },
                { id: "paper-alerts",  label: "Paper Generation Alerts",   desc: "Notify when your question paper is ready", value: paperAlerts,  onChange: setPaperAlerts  },
                { id: "credit-alerts", label: "Credit Low Alerts",         desc: "Warn when credits fall below 2",          value: creditAlerts, onChange: setCreditAlerts },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/60 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-gray-800 dark:text-white">{pref.label}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{pref.desc}</p>
                  </div>
                  <Switch id={pref.id} checked={pref.value} onCheckedChange={pref.onChange} className="data-[state=checked]:bg-blue-600" />
                </div>
              ))}
              <div className="pt-3">
                <Button onClick={handleSaveNotifications}
                  className="h-9 px-5 bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white text-xs font-medium">
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
