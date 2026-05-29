export type Language = "en-GB";

export interface TranslationDict {
  settings: {
    appearance: string;
    colorTheme: string;
    mode: string;
    light: string;
    dark: string;
    menuLayout: string;
    vertical: string;
    horizontal: string;
    language: string;
  };
  nav: {
    dashboard: string;
    siteMap: string;
    hbTemplates: string;
    uiKit: string;
    samplePage: string;
    userManagement: string;
    users: string;
    eventManagement: string;
    events: string;
    organisationalMaster: string;
    country: string;
    state: string;
    city: string;
    configurations: string;
    staticPages: string;
    emailTemplates: string;
    systemNotifications: string;
    systemSettings: string;
    roleManagement: string;
    logs: string;
    loginLogs: string;
    auditLogs: string;
    apiLogs: string;
    emailLogs: string;
  };
  common: {
    search: string;
    refresh: string;
    export: string;
    actions: string;
    view: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    active: string;
    inactive: string;
    status: string;
    noResults: string;
  };
}

export const languages: { id: Language; name: string; native: string; flag: string }[] = [
  { id: "en-GB", name: "UK English", native: "English (UK)", flag: "🇬🇧" },
];

export const translations: Record<Language, TranslationDict> = {
  "en-GB": {
    settings: {
      appearance: "Appearance",
      colorTheme: "Color Theme",
      mode: "Mode",
      light: "Light",
      dark: "Dark",
      menuLayout: "Menu Layout",
      vertical: "Vertical",
      horizontal: "Horizontal",
      language: "Language",
    },
    nav: {
      dashboard: "Dashboard",
      siteMap: "Site Map",
      hbTemplates: "HB Templates",
      uiKit: "UI Kit",
      samplePage: "Sample Page",
      userManagement: "User Management",
      users: "Users",
      eventManagement: "Event Management",
      events: "Events",
      organisationalMaster: "Master Managment",
      country: "Country",
      state: "State",
      city: "City",
      configurations: "Configurations",
      staticPages: "Static Pages",
      emailTemplates: "Email Templates",
      systemNotifications: "System Notifications",
      systemSettings: "System Settings",
      roleManagement: "Roles",
      logs: "Logs",
      loginLogs: "Login Logs",
      auditLogs: "Audit Logs",
      apiLogs: "API Logs",
      emailLogs: "Email Logs",
    },
    common: {
      search: "Search",
      refresh: "Refresh",
      export: "Export",
      actions: "Actions",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      active: "Active",
      inactive: "Inactive",
      status: "Status",
      noResults: "No results found",
    },
  },
};
