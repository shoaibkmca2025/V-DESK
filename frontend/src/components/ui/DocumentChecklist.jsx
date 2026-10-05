const GROUPS = [
  {
    icon: 'ph-user',
    title: 'Proprietor / Individual',
    docs: ['PAN card', 'Aadhaar card or passport', 'Passport-size photo', 'Cancelled cheque or bank proof'],
  },
  {
    icon: 'ph-users-three',
    title: 'Partnership / LLP',
    docs: ['PAN & Aadhaar of all partners', 'Partnership deed or LLP agreement', 'Firm PAN card', 'Firm bank account proof'],
  },
  {
    icon: 'ph-buildings',
    title: 'Private Limited Company',
    docs: ['Certificate of Incorporation', "Directors' PAN & Aadhaar", 'MOA, AOA or board resolution', 'Company PAN & cancelled cheque'],
  },
];

/** "What documents do I need?" — three plain checklists by business type. */
export default function DocumentChecklist() {
  return (
    <div className="ui-grid ui-grid--3">
      {GROUPS.map((group, index) => (
        <div key={group.title} className="ui-card">
          <div className={index === 1 ? 'ui-card__icon ui-card__icon--gold' : index === 2 ? 'ui-card__icon ui-card__icon--navy' : 'ui-card__icon'}>
            <i className={`ph-bold ${group.icon}`} />
          </div>
          <h3>{group.title}</h3>
          <ul className="ui-checks">
            {group.docs.map((doc) => (
              <li key={doc}>
                <i className="ph-bold ph-check-circle" /> {doc}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
