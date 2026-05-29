import { useEffect, useState } from "react";
import { Mail, Phone, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "./hb/listing/PageHeader";

const PROFILE_STORAGE_KEY = "myProfile";

interface ProfileForm {
  email: string;
  mobile: string;
}

const DEFAULT_PROFILE: ProfileForm = {
  email: "john.doe@company.com",
  mobile: "+44 7700 900123",
};

export default function MyProfile() {
  const [profile, setProfile] = useState<ProfileForm>(() => {
    if (typeof window === "undefined") return DEFAULT_PROFILE;

    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) return DEFAULT_PROFILE;

    try {
      return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_PROFILE;
    }
  });
  const [initialProfile, setInitialProfile] = useState(profile);

  useEffect(() => {
    setInitialProfile(profile);
  }, []);

  const hasChanges =
    profile.email !== initialProfile.email ||
    profile.mobile !== initialProfile.mobile;

  const setField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setProfile(current => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    setInitialProfile(profile);
    toast.success("Profile updated successfully.");
  };

  const handleReset = () => {
    setProfile(initialProfile);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your contact details for the membership management system."
        breadcrumbs={[
          { label: "Profile" },
          { label: "My Profile", current: true },
        ]}
      />

      <div className="mt-6 max-w-3xl">
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">John Doe</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Sales Manager</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-5">
            <div>
              <label htmlFor="profile-email" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={event => setField("email", event.target.value)}
                  className="w-full h-10 pl-10 pr-3 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email ID"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-mobile" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="profile-mobile"
                  type="tel"
                  value={profile.mobile}
                  onChange={event => setField("mobile", event.target.value)}
                  className="w-full h-10 pl-10 pr-3 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges}
              className="h-9 px-4 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges}
              className="h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
