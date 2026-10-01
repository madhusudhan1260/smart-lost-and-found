// File: src/components/ReportLayout.jsx
// Purpose: Page layout around the report form (tabs + tips sidebar).
// Used by: pages/ReportFound.jsx, pages/ReportLost.jsx

import { NavLink } from 'react-router-dom';
import PageHeader from './PageHeader';
import ItemForm from './ItemForm';
import Icon from './Icon';
import { cx } from '../utils/helpers';

const CONTENT = {
  lost: {
    icon: 'search',
    tone: 'blue',
    title: 'Report a lost item',
    subtitle: 'Describe what you lost. Smart Match will compare it with every found report.',
    tips: [
      'Mention brand, model and colour in the public description',
      'Keep one or two unique marks private – DOSS uses them to verify you',
      'Pick the exact campus location and date',
    ],
  },
  found: {
    icon: 'inventory_2',
    tone: 'green',
    title: 'Report a found item',
    subtitle: 'Thank you for helping! Describe the item so its owner can recognise it.',
    tips: [
      'Do not reveal every detail publicly – owners must prove what they know',
      'Note private details (scratches, stickers, contents) for DOSS',
      'Hand valuable items to the DOSS Office in the Administration Block',
    ],
  },
};

// Shared page layout for Report Lost / Report Found
export default function ReportLayout({ type }) {
  const { icon, tone, title, subtitle, tips } = CONTENT[type];

  return (
    <>
      <PageHeader icon={icon} tone={tone} eyebrow="New report" title={title} subtitle={subtitle} />
      <div className="container page-body report-layout">
        <div>
          <nav className="segmented" aria-label="Report type">
            <NavLink to="/report-lost" className={({ isActive }) => cx('segmented__item', isActive && 'is-active')}>
              <Icon name="search" /> I lost something
            </NavLink>
            <NavLink to="/report-found" className={({ isActive }) => cx('segmented__item', isActive && 'is-active')}>
              <Icon name="inventory_2" /> I found something
            </NavLink>
          </nav>
          {/* key gives a fresh form (and fresh state) when switching type */}
          <ItemForm key={type} type={type} />
        </div>

        <aside className="report-tips card">
          <h2><Icon name="tips_and_updates" /> Tips for a good report</h2>
          <ul>
            {tips.map((tip) => <li key={tip}><Icon name="check" /> {tip}</li>)}
          </ul>
          <p className="muted small">Fields marked <span className="req">*</span> are required.</p>
        </aside>
      </div>
    </>
  );
}
