import { useState, useRef } from 'react';
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
  FormTextarea,
  ErrorText,
} from './hb/common/Form';
import { toast } from 'sonner';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'mobile'>('general');
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    // Branding
    companyName: 'Hindu Swayamsevak Sangh UK',
    copyrightText: '© 2026 Hindu Swayamsevak Sangh UK. All rights reserved.',

    // SMTP
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'admin@hssuk.org',
    smtpPassword: '••••••••••••',
    smtpEncryption: 'TLS',
    senderName: 'HSS Admin',
    senderEmail: 'noreply@hssuk.org',

    // Organization
    address: 'Hindu Swayamsevak Sangh UK,\nBritannia House, 960 High Road,\nLondon, N12 9RY',
    adminEmail: 'admin@hssuk.org',
    contactNumber: '+44 (0) 20 8446 0756',
    websiteUrl: 'https://www.hssuk.org',

    // Regional
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'UTC+0 (Greenwich Mean Time)',
    currency: 'GBP (£)',
    language: 'UK English',
    
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

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const errCls = (key: string) => errors[key] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';

  const FIELD_ORDER = ['companyName', 'smtpHost', 'smtpPort', 'smtpUsername', 'smtpPassword', 'senderName', 'senderEmail', 'address', 'adminEmail', 'maxLoginAttempts', 'sessionTimeout', 'androidVersion', 'iosVersion'];
  const FIELD_TAB: Record<string, 'general' | 'mobile'> = {
    companyName: 'general', smtpHost: 'general', smtpPort: 'general', smtpUsername: 'general', smtpPassword: 'general',
    senderName: 'general', senderEmail: 'general', address: 'general', adminEmail: 'general',
    maxLoginAttempts: 'general', sessionTimeout: 'general',
    androidVersion: 'mobile', iosVersion: 'mobile',
  };

  const validate = () => {
    const errs: Record<string, boolean> = {};
    if (!settings.companyName.trim())  errs.companyName = true;
    if (!settings.smtpHost.trim())     errs.smtpHost = true;
    if (!settings.smtpPort.trim())     errs.smtpPort = true;
    if (!settings.smtpUsername.trim()) errs.smtpUsername = true;
    if (!settings.smtpPassword.trim()) errs.smtpPassword = true;
    if (!settings.senderName.trim())   errs.senderName = true;
    if (!settings.senderEmail.trim())  errs.senderEmail = true;
    if (!settings.address.trim())      errs.address = true;
    if (!settings.adminEmail.trim())   errs.adminEmail = true;
    if (!settings.maxLoginAttempts || settings.maxLoginAttempts < 1) errs.maxLoginAttempts = true;
    if (!settings.sessionTimeout || settings.sessionTimeout < 1)     errs.sessionTimeout = true;
    if (!settings.androidVersion.trim()) errs.androidVersion = true;
    if (!settings.iosVersion.trim())     errs.iosVersion = true;
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fill in all required fields.');
      const firstKey = FIELD_ORDER.find(k => errs[k]);
      if (firstKey) {
        const tab = FIELD_TAB[firstKey];
        if (tab !== activeTab) setActiveTab(tab);
        setTimeout(() => {
          const el = fieldRefs.current[firstKey];
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        }, 60);
      }
      return;
    }
    setErrors({});
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
                        ref={el => { fieldRefs.current.companyName = el; }}
                        value={settings.companyName}
                        onChange={(e) => { setSettings({...settings, companyName: e.target.value}); setErrors(prev => ({ ...prev, companyName: false })); }}
                        placeholder="e.g. Hindu Swayamsevak Sangh UK"
                        className={errCls('companyName')}
                      />
                      <ErrorText>{errors.companyName && 'Company name is required.'}</ErrorText>
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
                        ref={el => { fieldRefs.current.smtpHost = el; }}
                        value={settings.smtpHost}
                        onChange={(e) => { setSettings({...settings, smtpHost: e.target.value}); setErrors(prev => ({ ...prev, smtpHost: false })); }}
                        className={errCls('smtpHost')}
                      />
                      <ErrorText>{errors.smtpHost && 'SMTP host is required.'}</ErrorText>
                    </FormField>
                    <FormField>
                      <FormLabel required>SMTP Port</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.smtpPort = el; }}
                        value={settings.smtpPort}
                        onChange={(e) => { setSettings({...settings, smtpPort: e.target.value}); setErrors(prev => ({ ...prev, smtpPort: false })); }}
                        className={errCls('smtpPort')}
                      />
                      <ErrorText>{errors.smtpPort && 'SMTP port is required.'}</ErrorText>
                    </FormField>
                    <FormField>
                      <FormLabel required>SMTP Username</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.smtpUsername = el; }}
                        value={settings.smtpUsername}
                        onChange={(e) => { setSettings({...settings, smtpUsername: e.target.value}); setErrors(prev => ({ ...prev, smtpUsername: false })); }}
                        className={errCls('smtpUsername')}
                      />
                      <ErrorText>{errors.smtpUsername && 'SMTP username is required.'}</ErrorText>
                    </FormField>
                    <FormField>
                      <FormLabel required>SMTP Password</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.smtpPassword = el; }}
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => { setSettings({...settings, smtpPassword: e.target.value}); setErrors(prev => ({ ...prev, smtpPassword: false })); }}
                        className={errCls('smtpPassword')}
                      />
                      <ErrorText>{errors.smtpPassword && 'SMTP password is required.'}</ErrorText>
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
                        ref={el => { fieldRefs.current.senderName = el; }}
                        value={settings.senderName}
                        onChange={(e) => { setSettings({...settings, senderName: e.target.value}); setErrors(prev => ({ ...prev, senderName: false })); }}
                        className={errCls('senderName')}
                      />
                      <ErrorText>{errors.senderName && 'Sender name is required.'}</ErrorText>
                    </FormField>
                    <FormField>
                      <FormLabel required>Sender Email Address</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.senderEmail = el; }}
                        value={settings.senderEmail}
                        onChange={(e) => { setSettings({...settings, senderEmail: e.target.value}); setErrors(prev => ({ ...prev, senderEmail: false })); }}
                        className={errCls('senderEmail')}
                      />
                      <ErrorText>{errors.senderEmail && 'Sender email is required.'}</ErrorText>
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
                          ref={el => { fieldRefs.current.address = el; }}
                          rows={3}
                          value={settings.address}
                          onChange={(e) => { setSettings({...settings, address: e.target.value}); setErrors(prev => ({ ...prev, address: false })); }}
                          className={errCls('address')}
                        />
                        <ErrorText>{errors.address && 'Address is required.'}</ErrorText>
                      </FormField>
                    </div>
                    <FormField>
                      <FormLabel required>Admin Email Address</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.adminEmail = el; }}
                        value={settings.adminEmail}
                        onChange={(e) => { setSettings({...settings, adminEmail: e.target.value}); setErrors(prev => ({ ...prev, adminEmail: false })); }}
                        className={errCls('adminEmail')}
                      />
                      <ErrorText>{errors.adminEmail && 'Admin email is required.'}</ErrorText>
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
                        <option value="GBP (£)">GBP (£)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="INR (₹)">INR (₹)</option>
                      </FormSelect>
                    </FormField>
                    <FormField>
                      <FormLabel>Language</FormLabel>
                      <FormSelect
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                      >
                        <option value="UK English">UK English</option>
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
                        ref={el => { fieldRefs.current.maxLoginAttempts = el; }}
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => { setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)}); setErrors(prev => ({ ...prev, maxLoginAttempts: false })); }}
                        className={errCls('maxLoginAttempts')}
                      />
                      <ErrorText>{errors.maxLoginAttempts && 'Enter a valid number.'}</ErrorText>
                    </FormField>
                    <FormField>
                      <FormLabel required>Session Timeout (Minutes)</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.sessionTimeout = el; }}
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => { setSettings({...settings, sessionTimeout: parseInt(e.target.value)}); setErrors(prev => ({ ...prev, sessionTimeout: false })); }}
                        className={errCls('sessionTimeout')}
                      />
                      <ErrorText>{errors.sessionTimeout && 'Enter a valid number.'}</ErrorText>
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
                          ref={el => { fieldRefs.current.androidVersion = el; }}
                          value={settings.androidVersion}
                          onChange={(e) => { setSettings({...settings, androidVersion: e.target.value}); setErrors(prev => ({ ...prev, androidVersion: false })); }}
                          placeholder="e.g. 1.0.0"
                          className={errCls('androidVersion')}
                        />
                        <ErrorText>{errors.androidVersion && 'Android app version is required.'}</ErrorText>
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
                          ref={el => { fieldRefs.current.iosVersion = el; }}
                          value={settings.iosVersion}
                          onChange={(e) => { setSettings({...settings, iosVersion: e.target.value}); setErrors(prev => ({ ...prev, iosVersion: false })); }}
                          placeholder="e.g. 1.0.0"
                          className={errCls('iosVersion')}
                        />
                        <ErrorText>{errors.iosVersion && 'iOS app version is required.'}</ErrorText>
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
