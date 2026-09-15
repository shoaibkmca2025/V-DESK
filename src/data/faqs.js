/** Site-wide FAQ page content grouped by topic (/faqs). */
export const FAQ_GROUPS = [
  {
    id: 'virtual-office',
    title: 'Virtual Office & Business Address',
    icon: 'ph-buildings',
    items: [
      ['Is a Virtual Office 100% legal for GST and company registration in India?', 'Yes. Under the CGST Act 2017 and MCA SPICe+ rules a business may operate from a commercial address if it holds a registered rent agreement, owner NOC and a recent utility bill. V-DESK provides all three, verified.'],
      ['How quickly is my address activated?', 'Documents are issued within 24 working hours of KYC approval and are downloadable from the customer portal.'],
      ['Can I receive couriers and government mail?', 'Yes. Mail is logged within four working hours with a WhatsApp alert; forwarding and scanning are available as add-ons.'],
      ['What if I need to change centres later?', 'Addresses can be transferred within the same city once per year at no cost under our address replacement policy.'],
    ],
  },
  {
    id: 'gst',
    title: 'GST Registration',
    icon: 'ph-receipt',
    items: [
      ['Which documents do I need for GST registration?', 'PAN and Aadhaar of promoters, photographs, bank proof, and address proof (rent agreement, NOC, utility bill).'],
      ['What is the difference between PPOB and APOB?', 'PPOB is the principal place of business shown on the GSTIN; APOB is an additional address such as a warehouse under the same registration.'],
      ['Will you help with a physical verification?', 'Our centre team hosts the officer, presents the name board and visit register and shares the visit report with you.'],
    ],
  },
  {
    id: 'workspaces',
    title: 'Coworking, Cabins & Meeting Rooms',
    icon: 'ph-laptop',
    items: [
      ['What is included in a dedicated desk?', 'A reserved ergonomic desk, enterprise Wi-Fi, printing, pantry, meeting-room credits and 24/7 access at select centres.'],
      ['How does a meeting-room hold work?', 'Selecting a slot places a 10-minute hold while you complete payment; the hold releases automatically if unpaid.'],
      ['Can my team expand into more desks mid-contract?', 'Yes — add desks or move to a private cabin at any time subject to availability; pricing is prorated.'],
    ],
  },
  {
    id: 'billing',
    title: 'Pricing, Billing & Refunds',
    icon: 'ph-credit-card',
    items: [
      ['Are prices inclusive of GST?', 'Listed prices exclude GST; the configurator and checkout show the 18% GST line and total before payment. Registered businesses can claim input tax credit.'],
      ['What payment methods are accepted?', 'UPI, credit and debit cards and net banking through a PCI-DSS compliant gateway.'],
      ['What is the refund policy?', 'Full refund if a GST or MCA application is rejected solely due to a V-DESK document defect. Cancellations within 48 hours before document issuance are refunded less gateway charges.'],
    ],
  },
  {
    id: 'kyc',
    title: 'KYC & Data Security',
    icon: 'ph-shield-check',
    items: [
      ['Why is KYC required?', 'Statutory requirement for issuing a rent agreement and NOC in the entity name and for GST/MCA compliance.'],
      ['How are my documents stored?', 'Encrypted at rest and in transit, accessible only through time-limited signed links, never shared with third parties.'],
      ['How long does verification take?', 'Within four working hours; rejections always include the reason and a re-upload option.'],
    ],
  },
];
