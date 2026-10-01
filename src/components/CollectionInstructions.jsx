// File: src/components/CollectionInstructions.jsx
// Purpose: Steps a student follows to collect an item from the DOSS office.
// Used by: components/ClaimCard.jsx

import { DOSS_OFFICE } from '../data/constants';
import Icon from './Icon';

// Shown to the student once DOSS accepts the claim
export default function CollectionInstructions({ claimId }) {
  const steps = [
    { icon: 'location_on', text: `Go to the ${DOSS_OFFICE.place}.` },
    { icon: 'schedule', text: `Office hours: ${DOSS_OFFICE.hours}.` },
    { icon: 'badge', text: 'Bring your student ID card for verification.' },
    { icon: 'tag', text: `Quote your claim ID ${claimId}.` },
    { icon: 'draw', text: 'Sign the handover register when you receive the item.' },
  ];

  return (
    <ol className="instructions">
      {steps.map(({ icon, text }) => (
        <li key={icon}><Icon name={icon} /> {text}</li>
      ))}
      <li className="muted"><Icon name="call" /> Questions? Call {DOSS_OFFICE.phone}</li>
    </ol>
  );
}
