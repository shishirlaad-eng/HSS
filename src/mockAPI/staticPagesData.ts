export interface StaticPage {
  id: string;
  name: string;
  slug: string;
  content: string;
  lastUpdated: string;
  updatedBy: string;
}

export const mockStaticPages: StaticPage[] = [
  {
    id: 'SP-001',
    name: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    content: 'Welcome to FadeOut. These Terms and Conditions govern your use of our mobile application and services. By accessing or using FadeOut, you agree to be bound by these terms. If you do not agree to these terms, please do not use the application.\n\n1. Use of Service\nYou must be at least 13 years old to use this service. You are responsible for maintaining the confidentiality of your account information.\n\n2. User Content\nUsers are responsible for the content they post. FadeOut reserves the right to remove any content that violates our guidelines.\n\n3. Privacy\nYour privacy is important to us. Please refer to our Privacy Policy for details on how we collect and use your data.',
    lastUpdated: '2024-03-15T14:30:00Z',
    updatedBy: 'Admin Sarah',
  },
  {
    id: 'SP-002',
    name: 'Privacy Policy',
    slug: 'privacy-policy',
    content: 'At FadeOut, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our mobile application.\n\n1. Information We Collect\nWe collect information you provide directly to us, such as when you create an account or participate in an event.\n\n2. How We Use Information\nWe use the information we collect to provide, maintain, and improve our services, and to communicate with you.\n\n3. Data Sharing\nWe do not share your personal information with third parties except as described in this policy.',
    lastUpdated: '2024-02-28T10:15:00Z',
    updatedBy: 'Admin Michael',
  },
  {
    id: 'SP-003',
    name: 'About FadeOut',
    slug: 'about-fadeout',
    content: 'FadeOut is a social platform designed to help people connect through events that naturally fade out. We believe in spontaneous connections and meaningful interactions that live in the moment.\n\nOur mission is to reduce digital clutter and encourage real-world engagement by creating spaces that exist only as long as they are needed.\n\nJoin us in redefining social interaction for the modern age.',
    lastUpdated: '2024-01-10T09:00:00Z',
    updatedBy: 'Admin Sarah',
  },
];
