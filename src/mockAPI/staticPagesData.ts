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
    content: 'These Terms and Conditions govern use of the HSS UK Membership Management services. By submitting a membership registration, you confirm that the information provided is accurate and that you will notify HSS UK of any important changes.\n\n1. Membership Registration\nMembership applications may be reviewed by authorised HSS UK administrators before access to Karyakrams, Shakhas, or member services is enabled.\n\n2. Member Responsibilities\nMembers are expected to follow HSS UK policies, safeguarding expectations, and local activity centre guidance while participating in HSS activities.\n\n3. Parent or Guardian Consent\nFor members requiring parental or guardian approval, registration may remain pending until the required consent is received.\n\n4. Data Accuracy\nYou are responsible for keeping contact, emergency contact, medical, and guardian details accurate and up to date.',
    lastUpdated: '2024-03-15T14:30:00Z',
    updatedBy: 'Admin Sarah',
  },
  {
    id: 'SP-002',
    name: 'Privacy Policy',
    slug: 'privacy-policy',
    content: 'HSS UK respects your privacy and handles member information in line with applicable data protection requirements.\n\n1. Information We Collect\nWe collect registration details such as name, date of birth, contact information, address, emergency contact details, parent or guardian information where applicable, organisation placement, and relevant medical or dietary information.\n\n2. How We Use Information\nInformation is used to manage membership records, activity centre allocation, attendance, safeguarding, Karyakram participation, approvals, and essential communication.\n\n3. Data Sharing\nMember information is only shared with authorised administrators and volunteers where needed for membership administration, safeguarding, or Karyakram operations.\n\n4. Your Rights\nYou may request updates to your information and may contact HSS UK administrators for questions about how your information is held or used.',
    lastUpdated: '2024-03-15T14:30:00Z',
    updatedBy: 'Admin Sarah',
  },
];
