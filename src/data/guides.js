/** Resources / knowledge centre articles (/resources/:slug). */
export const GUIDE_CATEGORIES = ['All', 'GST', 'Incorporation', 'Workspace', 'Compliance'];

export const GUIDES = [
  {
    slug: 'virtual-office-gst-rules-2026',
    title: 'Virtual Office for GST in 2026: Rules, Documents & Officer Verification',
    category: 'GST',
    readTime: 7,
    date: '2026-08-12',
    excerpt: 'What the CGST Act requires from a registered address, which three documents every officer asks for, and how physical verification actually works.',
    sections: [
      ['Is a virtual office a valid place of business?', 'Yes. Section 2(85) of the CGST Act defines a place of business as any premises from which business is ordinarily carried on. A commercial address held under a valid rent agreement with owner consent qualifies. What matters is documentation, not desk usage.'],
      ['The three documents', 'Every application under Form REG-01 needs (1) a registered or notarized rent/lease agreement in the entity name, (2) a no-objection certificate from the property owner and (3) a recent utility bill or municipal tax receipt for the same premises. Mismatched addresses across the three are the most common rejection reason.'],
      ['Physical verification', 'Under Rule 25 the proper officer may visit the premises. Centres must display a name board with the taxpayer name and GSTIN, keep a visitor register, and have staff who can confirm the tenancy. V-DESK centres host these visits and share a visit report.'],
      ['APOB for marketplace sellers', 'Amazon, Flipkart and Meesho sellers storing goods in fulfilment centres must add those warehouses as additional places of business. Each state needs its own GSTIN; V-DESK provides addresses in 10+ states so onboarding is not blocked.'],
    ],
  },
  {
    slug: 'pvt-ltd-vs-llp',
    title: 'Private Limited vs LLP: Choosing the Right Structure for Your Startup',
    category: 'Incorporation',
    readTime: 6,
    date: '2026-07-30',
    excerpt: 'Liability, fundraising, compliance load and tax — a side-by-side view to decide before you file SPICe+.',
    sections: [
      ['Ownership & funding', 'A Private Limited Company issues shares, supports ESOPs and is the structure investors expect. An LLP has partners with capital contribution and cannot issue equity, which makes venture funding impractical.'],
      ['Compliance', 'Pvt Ltd requires a statutory audit regardless of turnover, board meetings and annual filings (AOC-4, MGT-7). An LLP needs an audit only above ₹40 lakh turnover or ₹25 lakh contribution, and files Form 8 and Form 11 annually.'],
      ['Taxation', 'Both are taxed at entity level; LLPs avoid dividend distribution complexity because profit shares to partners are exempt in their hands.'],
      ['Our recommendation', 'Raising capital or hiring with ESOPs → Pvt Ltd. Professional services with stable partners → LLP. Solo founder → OPC, converting to Pvt Ltd later.'],
    ],
  },
  {
    slug: 'coworking-vs-traditional-lease',
    title: 'Coworking vs Traditional Lease: The Real Cost of an Office for a 10-Person Team',
    category: 'Workspace',
    readTime: 5,
    date: '2026-07-02',
    excerpt: 'Deposit, fit-out, maintenance and lock-in add up. Here is the 12-month cost model behind our ROI calculator.',
    sections: [
      ['Upfront capital', 'A conventional lease in a Grade-A tower typically asks for a 6–10 month security deposit and ₹1,500–2,500 per sq ft of fit-out. For 1,500 sq ft that is ₹30–50 lakh before the first working day.'],
      ['Recurring costs', 'Rent, CAM charges, electricity, internet, housekeeping, security and reception staff commonly add 35–45% on top of the headline rent.'],
      ['Flexible alternative', 'Dedicated desks bundle all of the above per seat per month with a 1–12 month commitment, no fit-out and no long lock-in. The trade-off is less branding control and shared amenities.'],
      ['Break-even', 'For teams under 25 people or with less than 24 months of visibility, flexible workspace is almost always cheaper on a total-cost basis. Run your numbers in the pricing calculator.'],
    ],
  },
  {
    slug: 'gst-physical-verification-checklist',
    title: 'GST Physical Verification Checklist for Businesses Using a Shared Address',
    category: 'Compliance',
    readTime: 4,
    date: '2026-06-18',
    excerpt: 'Ten things the officer checks, and how to be ready for each of them.',
    sections: [
      ['Before the visit', 'Confirm the name board is installed with the exact legal name and GSTIN, the rent agreement is on file at the centre, and an authorised signatory is reachable by phone.'],
      ['During the visit', 'The officer photographs the board and premises, checks the visitor register and may ask staff to confirm the tenancy. Keep the KYC documents accessible on the portal.'],
      ['After the visit', 'A verification report (REG-30) is uploaded by the officer. If a query is raised, respond within seven working days with the requested proof.'],
    ],
  },
  {
    slug: 'meeting-room-etiquette-hybrid-teams',
    title: 'Booking Meeting Rooms for Hybrid Teams: Capacity, AV and Hold Windows',
    category: 'Workspace',
    readTime: 3,
    date: '2026-05-25',
    excerpt: 'Pick the right room size, avoid overbooking and use hold windows so slots are not lost during approvals.',
    sections: [
      ['Right-size the room', 'Huddle rooms (4) for stand-ups and interviews, conference rooms (8) for client reviews, boardrooms (12+) for investor and board meetings.'],
      ['Hold windows', 'A 10-minute hold locks a slot while payment or internal approval completes. Holds expire automatically so inventory is never stuck.'],
      ['AV checklist', 'Wireless casting, a 4K display and a conference camera cover 95% of hybrid calls. Ask for a video bar for rooms above eight seats.'],
    ],
  },
  {
    slug: 'annual-compliance-calendar-private-limited',
    title: 'Annual Compliance Calendar for a Private Limited Company',
    category: 'Compliance',
    readTime: 6,
    date: '2026-04-10',
    excerpt: 'Every ROC, income-tax and GST deadline in one place, from INC-20A to AOC-4.',
    sections: [
      ['First 180 days', 'File INC-20A (commencement of business) within 180 days, appoint the first auditor within 30 days, open a current account and deposit subscription money.'],
      ['Every year', 'Hold the AGM within six months of year end; file AOC-4 within 30 days and MGT-7 within 60 days of the AGM; file DIR-3 KYC for every director by 30 September.'],
      ['Tax', 'ITR-6 by 31 October (audit cases), monthly/quarterly GSTR-1 and GSTR-3B, annual GSTR-9 by 31 December, TDS returns quarterly.'],
    ],
  },
];

export const getGuide = (slug) => GUIDES.find((g) => g.slug === slug);
