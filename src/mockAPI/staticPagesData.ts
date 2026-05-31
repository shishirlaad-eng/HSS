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
];
