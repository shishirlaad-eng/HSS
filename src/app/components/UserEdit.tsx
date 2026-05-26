import { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  User as UserIcon,
  Mail,
  Shield,
  AlertCircle
} from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormSection, FormField, FormLabel, FormInput, StatusSlider } from './hb/common';
import { User } from '../../mockAPI/usersData';
import { toast } from 'sonner';

interface UserEditProps {
  user: User;
  onBack: () => void;
}

export default function UserEdit({ user, onBack }: UserEditProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    status: user.status as 'active' | 'inactive',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("User updated successfully.");
      onBack();
    } catch (err) {
      toast.error("Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        {/* PAGE HEADER */}
        <PageHeader
          title="Edit User Profile"
          breadcrumbs={[
            { label: 'User Management', onClick: onBack },
            { label: 'View Profile', onClick: onBack },
            { label: 'Edit', current: true },
          ]}
        >
          <div className="flex items-center gap-3">
            <SecondaryButton icon={ArrowLeft} onClick={onBack}>
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              icon={Save} 
              onClick={handleSave}
              isLoading={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN FORM AREA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <UserIcon className="w-4 h-4 text-primary-600" />
                Personal Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField>
                  <FormLabel required>Full Name</FormLabel>
                  <FormInput
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Email Address</FormLabel>
                  <FormInput
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </FormField>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Shield className="w-4 h-4 text-primary-600" />
                Account Status & Permissions
              </div>

              <div className="max-w-xs">
                <FormField>
                  <FormLabel>Account Status</FormLabel>
                  <StatusSlider
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val as 'active' | 'inactive' })}
                    options={[
                      { value: 'active', label: 'Active', color: 'bg-success-500' },
                      { value: 'inactive', label: 'Inactive', color: 'bg-neutral-400' },
                    ]}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* SIDEBAR INFO */}
          <div className="space-y-6">
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Important Note</h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                Updating user information will sync across all platforms. Changing the email address will require the user to verify their new email before they can access certain features again.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Account Reference</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">User ID</label>
                  <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400">{user.id}</code>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Join Date</label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{new Date(user.createdDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
