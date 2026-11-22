/**
 * The three address plans, as the client's rate card states them.
 *
 * One list, used by the home, virtual-office and pricing pages — they each carried their own copy of the
 * old plans, which is how they drifted. Prices are per month, billed annually.
 */

export const PLANS = [
  {
    name: 'Business Registration Plan',
    icon: 'ph-buildings',
    price: 949,
    billedAnnually: true,
    source: 'Business Registration Plan',
    features: [
      ['Address for new company registration'],
      ['Change the registered address of your company'],
      ['Address for new GST registration, APOB registration etc.'],
      ['Mails & courier handling'],
      ['Utilise address for GST registration'],
      ['On-site GST / departmental verification'],
      ['Courier receiving and forwarding services'],
      ['Use a professional address across all official platforms'],
    ],
  },
  {
    name: 'GST Registration Plan',
    icon: 'ph-receipt',
    price: 849,
    billedAnnually: true,
    popular: true,
    source: 'GST Registration Plan',
    features: [
      ['New GST registration, APOB registration'],
      ['Mails & courier handling, address for website, business cards, letterheads'],
      ['Utilise the provided address for correspondence'],
      ['On-site GST / departmental verification'],
      ['Courier receiving and forwarding services'],
      ['Use a professional address across all official platforms'],
    ],
  },
  {
    name: 'Business Address Plan',
    icon: 'ph-map-pin-area',
    price: 749,
    billedAnnually: true,
    source: 'Business Address Plan',
    features: [
      ['Address for website, business cards, letterheads, mails & courier handling'],
      ['Courier receiving and sending services'],
      ['Use of the address on your website, visiting cards, webmail etc.'],
    ],
  },
];
