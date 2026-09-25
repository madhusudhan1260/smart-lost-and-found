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
