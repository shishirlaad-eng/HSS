import { useState } from 'react';
import { 
  Shield, 
  Palette, 
  Smartphone, 
  Image as ImageIcon, 
  Upload, 
  Save, 
  X,
  AlertCircle,
  Globe,
  Settings,
  Mail,
  Building,
  Languages,
  Lock,
  Server,
  Link,
  Phone
} from 'lucide-react';
import { 
  PageHeader, 
  PrimaryButton, 
  SecondaryButton 
} from './hb/listing';
import { 
  FormCard, 
  FormField, 
  FormLabel, 
  FormInput, 
  FormGrid, 
  FormSection,
  FormSelect,
  FormTextarea
} from './hb/common/Form';
import { toast } from 'sonner';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'mobile'>('general');
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    // Branding
    companyName: 'FadeOut Social',
    copyrightText: '© 2024 FadeOut Social. All rights reserved.',
    
    // SMTP
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'admin@fadeout.com',
    smtpPassword: '••••••••••••',
    smtpEncryption: 'TLS',
    senderName: 'FadeOut Admin',
    senderEmail: 'noreply@fadeout.com',
    
    // Organization
    address: '123 Enterprise Way,\nSuite 500,\nTech City, TC 12345',
    adminEmail: 'support@fadeout.com',
    contactNumber: '+1 (555) 000-1234',
    websiteUrl: 'https://fadeout.social',
    
    // Regional
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'UTC+0 (Greenwich Mean Time)',
    currency: 'USD ($)',
    language: 'English (US)',
    
    // Security
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    
    // Mobile
    androidVersion: '1.2.4',
    iosVersion: '1.2.4',
    forceAndroidUpdate: false,
    forceIosUpdate: false,
    androidUpdateMessage: 'A new version of the Android app is available with critical security updates.',
    iosUpdateMessage: 'Important updates are available for your iOS device to improve performance.'
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('System settings updated successfully.');
    } catch (error) {
      toast.error('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      window.location.reload();
    }
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="System Settings"
          subtitle="Manage global branding, application, communication, and mobile-related configurations."
          breadcrumbs={[
            { label: 'Configurations', href: '#' },
            { label: 'System Settings', current: true },
          ]}
        />

        {/* MANDATORY TABS NAVIGATION */}
        <div className="flex items-center gap-1 mt-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-[48px] z-20">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'general'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            General
            {activeTab === 'general' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'mobile'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            Mobile Related
            {activeTab === 'mobile' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
            )}
          </button>
        </div>

        <div className="mt-8 pb-24">
          {activeTab === 'general' ? (
            <div className="space-y-6">
              {/* BRANDING SECTION */}
              <FormCard 
                title="Branding" 
                description="Customise your platform's visual identity"
                icon={Palette}
              >
                <FormSection title="Identity Assets">
                  <FormGrid cols={2}>
                    <FormField>
                      <FormLabel required>Company Name</FormLabel>
                      <FormInput 
                        value={settings.companyName}
                        onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                        placeholder="e.g. FadeOut Social"
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Copyright Text</FormLabel>
                      <FormInput 
                        value={settings.copyrightText}
                        onChange={(e) => setSettings({...settings, copyrightText: e.target.value})}
                      />
                    </FormField>
                  </FormGrid>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <FormLabel>Platform Logo</FormLabel>
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 overflow-hidden group relative">
                          <div className="p-3 bg-primary-600 rounded-full">
                            <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <PrimaryButton icon={Upload} className="w-fit py-1 h-8 text-[11px]">
                            Upload Logo
                          </PrimaryButton>
                          <p className="text-[10px] text-neutral-500">Recommended: 512x512px (PNG, SVG)</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <FormLabel>Favicon</FormLabel>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded border border-neutral-200 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
                          <ImageIcon className="w-6 h-6 text-neutral-300 dark:text-neutral-700" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <SecondaryButton icon={Upload} className="w-fit py-1 h-8 text-[11px]">
                            Upload Icon
                          </SecondaryButton>
                          <p className="text-[10px] text-neutral-500">Recommended: 32x32px (ICO, PNG)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FormSection>
              </FormCard>

              {/* COMMUNICATION / SMTP SECTION */}
              <FormCard 
                title="Communication / SMTP" 
                description="Configure outgoing email server settings"
                icon={Server}
              >
                <FormSection title="SMTP Configuration">
                  <FormGrid cols={2}>
                    <FormField>
                      <FormLabel required>SMTP Host</FormLabel>
                      <FormInput 
                        value={settings.smtpHost}
                        onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel required>SMTP Port</FormLabel>
                      <FormInput 
                        value={settings.smtpPort}
                        onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel required>SMTP Username</FormLabel>
                      <FormInput 
                        value={settings.smtpUsername}
                        onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel required>SMTP Password</FormLabel>
                      <FormInput 
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel required>Encryption Type</FormLabel>
                      <FormSelect
                        value={settings.smtpEncryption}
                        onChange={(e) => setSettings({...settings, smtpEncryption: e.target.value})}
                      >
                        <option value="None">None</option>
                        <option value="SSL">SSL</option>
                        <option value="TLS">TLS</option>
                      </FormSelect>
                    </FormField>
                  </FormGrid>
                </FormSection>
                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-6" />
                <FormSection title="Sender Details">
                  <FormGrid cols={2}>
                    <FormField>
                      <FormLabel required>Sender Name</FormLabel>
                      <FormInput 
                        value={settings.senderName}
                        onChange={(e) => setSettings({...settings, senderName: e.target.value})}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel required>Sender Email Address</FormLabel>
                      <FormInput 
                        value={settings.senderEmail}
                        onChange={(e) => setSettings({...settings, senderEmail: e.target.value})}
                      />
                    </FormField>
                  </FormGrid>
                </FormSection>
              </FormCard>

              {/* ORGANIZATION INFORMATION SECTION */}
              <FormCard 
                title="Organization Information" 
                description="Corporate and contact details for legal compliance"
                icon={Building}
              >
                <FormSection title="Contact Info">
                  <FormGrid cols={2}>
                    <div className="col-span-2">
                      <FormField>
                        <FormLabel required>Address</FormLabel>
                        <FormTextarea 
                          rows={3}
                          value={settings.address}
                          onChange={(e) => setSettings({...settings, address: e.target.value})}
                        />
                      </FormField>
                    </div>
                    <FormField>
                      <FormLabel required>Admin Email Address</FormLabel>
                      <FormInput 
                        value={settings.adminEmail}
                        onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Contact Number</FormLabel>
                      <FormInput 
                        value={settings.contactNumber}
                        onChange={(e) => setSettings({...settings, contactNumber: e.target.value})}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Website URL</FormLabel>
                      <FormInput 
                        value={settings.websiteUrl}
                        onChange={(e) => setSettings({...settings, websiteUrl: e.target.value})}
                      />
                    </FormField>
                  </FormGrid>
                </FormSection>
              </FormCard>

              {/* REGIONAL SETTINGS SECTION */}
              <FormCard 
                title="Regional Settings" 
                description="Configure date, time, and language preferences"
                icon={Languages}
              >
                <FormSection title="Localisation">
                  <FormGrid cols={2}>
                    <FormField>
                      <FormLabel required>Date Format</FormLabel>
                      <FormSelect
                        value={settings.dateFormat}
                        onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </FormSelect>
                    </FormField>
                    <FormField>
                      <FormLabel required>Time Zone</FormLabel>
                      <FormSelect
                        value={settings.timeZone}
                        onChange={(e) => setSettings({...settings, timeZone: e.target.value})}
                      >
                        <option value="UTC+0 (Greenwich Mean Time)">UTC+0 (Greenwich Mean Time)</option>
                        <option value="UTC+5:30 (Indian Standard Time)">UTC+5:30 (Indian Standard Time)</option>
                        <option value="UTC-5 (Eastern Standard Time)">UTC-5 (Eastern Standard Time)</option>
                      </FormSelect>
                    </FormField>
                    <FormField>
                      <FormLabel required>Currency</FormLabel>
                      <FormSelect
                        value={settings.currency}
                        onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      >
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                      </FormSelect>
                    </FormField>
                    <FormField>
                      <FormLabel>Language</FormLabel>
                      <FormSelect
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                      >
                        <option value="English (US)">English (US)</option>
                        <option value="English (UK)">English (UK)</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                      </FormSelect>
                    </FormField>
                  </FormGrid>
                </FormSection>
              </FormCard>

              {/* SECURITY SECTION */}
              <FormCard 
                title="Security" 
                description="Account protection and session management policies"
                icon={Lock}
              >
                <FormSection title="Access Control">
                  <FormGrid cols={2}>
                    <FormField>
                      <FormLabel required>Maximum Login Attempts</FormLabel>
                      <FormInput 
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel required>Session Timeout (Minutes)</FormLabel>
                      <FormInput 
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                      />
                    </FormField>
                  </FormGrid>
                </FormSection>
              </FormCard>
            </div>
          ) : (
            <div className="space-y-6">
              {/* MOBILE APP VERSIONS SECTION */}
              <FormCard 
                title="Mobile App Versions" 
                description="Control application release versions and update requirements"
                icon={Smartphone}
              >
                <FormSection title="Android Application">
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <FormGrid cols={2}>
                      <FormField>
                        <FormLabel required>Android App Version</FormLabel>
                        <FormInput 
                          value={settings.androidVersion}
                          onChange={(e) => setSettings({...settings, androidVersion: e.target.value})}
                          placeholder="e.g. 1.0.0"
                        />
                      </FormField>
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Force Android Update</div>
                          <div className="text-xs text-neutral-500">Require users to update immediately</div>
                        </div>
                        <button 
                          onClick={() => setSettings({...settings, forceAndroidUpdate: !settings.forceAndroidUpdate})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-primary-500 ${settings.forceAndroidUpdate ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-800'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.forceAndroidUpdate ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="col-span-2 mt-4">
                        <FormField>
                          <FormLabel>Android Update Message</FormLabel>
                          <FormTextarea 
                            rows={2}
                            value={settings.androidUpdateMessage}
                            onChange={(e) => setSettings({...settings, androidUpdateMessage: e.target.value})}
                          />
                        </FormField>
                      </div>
                    </FormGrid>
                  </div>
                </FormSection>

                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-8" />

                <FormSection title="iOS Application">
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <FormGrid cols={2}>
                      <FormField>
                        <FormLabel required>iOS App Version</FormLabel>
                        <FormInput 
                          value={settings.iosVersion}
                          onChange={(e) => setSettings({...settings, iosVersion: e.target.value})}
                          placeholder="e.g. 1.0.0"
                        />
                      </FormField>
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Force iOS Update</div>
                          <div className="text-xs text-neutral-500">Require users to update immediately</div>
                        </div>
                        <button 
                          onClick={() => setSettings({...settings, forceIosUpdate: !settings.forceIosUpdate})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-primary-500 ${settings.forceIosUpdate ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-800'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.forceIosUpdate ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="col-span-2 mt-4">
                        <FormField>
                          <FormLabel>iOS Update Message</FormLabel>
                          <FormTextarea 
                            rows={2}
                            value={settings.iosUpdateMessage}
                            onChange={(e) => setSettings({...settings, iosUpdateMessage: e.target.value})}
                          />
                        </FormField>
                      </div>
                    </FormGrid>
                  </div>
                </FormSection>
              </FormCard>
            </div>
          )}
        </div>

        {/* STICKY FOOTER ACTIONS */}
        <div className="fixed bottom-0 right-0 left-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-4 z-30 ml-[260px]">
          <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
            <SecondaryButton icon={X} onClick={handleReset}>
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              icon={Save} 
              onClick={handleSave}
              isLoading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
