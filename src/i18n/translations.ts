export type Language = "en" | "de" | "es";

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
    hbTemplates: string;
    uiKit: string;
    samplePage: string;
    userManagement: string;
    users: string;
    eventManagement: string;
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
  { id: "en", name: "English", native: "English", flag: "🇺🇸" },
  { id: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { id: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
];

export const translations: Record<Language, TranslationDict> = {
  en: {
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
  de: {
    settings: {
      appearance: "Erscheinungsbild",
      colorTheme: "Farbthema",
      mode: "Modus",
      light: "Hell",
      dark: "Dunkel",
      menuLayout: "Menü-Layout",
      vertical: "Vertikal",
      horizontal: "Horizontal",
      language: "Sprache",
    },
    nav: {
      dashboard: "Dashboard",
      siteMap: "Sitemap",
      hbTemplates: "HB-Vorlagen",
      uiKit: "UI-Kit",
      samplePage: "Beispielseite",
      userManagement: "Benutzerverwaltung",
      users: "Benutzer",
      eventManagement: "Veranstaltungsverwaltung",
      events: "Veranstaltungen",
      organisationalMaster: "Stammdaten",
      country: "Land",
      state: "Bundesland",
      city: "Stadt",
      configurations: "Konfigurationen",
      staticPages: "Statische Seiten",
      emailTemplates: "E-Mail-Vorlagen",
      systemNotifications: "Systembenachrichtigungen",
      systemSettings: "Systemeinstellungen",
      roleManagement: "Rollen",
      logs: "Protokolle",
      loginLogs: "Login-Protokolle",
      auditLogs: "Audit-Protokolle",
      apiLogs: "API-Protokolle",
      emailLogs: "E-Mail-Protokolle",
    },
    common: {
      search: "Suchen",
      refresh: "Aktualisieren",
      export: "Exportieren",
      actions: "Aktionen",
      view: "Ansehen",
      edit: "Bearbeiten",
      delete: "Löschen",
      save: "Speichern",
      cancel: "Abbrechen",
      active: "Aktiv",
      inactive: "Inaktiv",
      status: "Status",
      noResults: "Keine Ergebnisse gefunden",
    },
  },
  es: {
    settings: {
      appearance: "Apariencia",
      colorTheme: "Tema de Color",
      mode: "Modo",
      light: "Claro",
      dark: "Oscuro",
      menuLayout: "Disposición del Menú",
      vertical: "Vertical",
      horizontal: "Horizontal",
      language: "Idioma",
    },
    nav: {
      dashboard: "Tablero",
      siteMap: "Mapa del Sitio",
      hbTemplates: "Plantillas HB",
      uiKit: "Kit de UI",
      samplePage: "Página de Ejemplo",
      userManagement: "Gestión de Usuarios",
      users: "Usuarios",
      eventManagement: "Gestión de Eventos",
      events: "Eventos",
      organisationalMaster: "Módulos Maestros",
      country: "País",
      state: "Estado",
      city: "Ciudad",
      configurations: "Configuraciones",
      staticPages: "Páginas Estáticas",
      emailTemplates: "Plantillas de Correo",
      systemNotifications: "Notificaciones del Sistema",
      systemSettings: "Configuración del Sistema",
      roleManagement: "Roles",
      logs: "Registros",
      loginLogs: "Registros de Inicio",
      auditLogs: "Registros de Auditoría",
      apiLogs: "Registros de API",
      emailLogs: "Registros de Correo",
    },
    common: {
      search: "Buscar",
      refresh: "Actualizar",
      export: "Exportar",
      actions: "Acciones",
      view: "Ver",
      edit: "Editar",
      delete: "Eliminar",
      save: "Guardar",
      cancel: "Cancelar",
      active: "Activo",
      inactive: "Inactivo",
      status: "Estado",
      noResults: "No se encontraron resultados",
    },
  },
};
