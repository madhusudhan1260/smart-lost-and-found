// File: src/components/ItemImage.jsx
// Purpose: Shows the item photo, or a coloured category icon when there is none.
// Used by: components/ClaimCard.jsx, components/ClaimReview.jsx, components/ItemCard.jsx,
//          components/MatchCard.jsx, components/MatchPairList.jsx, pages/ClaimItem.jsx,
//          pages/DossDashboard.jsx, pages/ItemDetails.jsx, pages/ResolvedItems.jsx,
//          pages/SmartMatch.jsx

import { CATEGORY_META } from '../data/constants';
import { cx, getItemIcon } from '../utils/helpers';
import Icon from './Icon';

// Shows the uploaded photo, or a soft coloured tile with an icon when there is none
export default function ItemImage({ item, className }) {
  const { image, name, category } = item;
  const color = CATEGORY_META[category]?.color ?? '#5F6368';

  if (image) {
    return <img src={image} alt={`Photo of ${name}`} className={cx('item-image', className)} loading="lazy" />;
  }

  return (
    <div
      className={cx('item-image item-image--placeholder', className)}
      style={{ '--accent': color }}
      role="img"
      aria-label={`${category} icon for ${name}`}
    >
      <Icon name={getItemIcon(item)} />
    </div>
  );
}
