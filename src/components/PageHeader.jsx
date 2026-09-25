import Icon from './Icon';

// Title area at the top of each page
export default function PageHeader({ icon, eyebrow, title, subtitle, tone = 'blue', children }) {
  return (
    <section className="page-header">
      <div className="container page-header__inner">
        <div className="page-header__text">
          {icon && <span className={`page-header__icon tone--${tone}`}><Icon name={icon} /></span>}
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="page-header__actions">{children}</div>}
      </div>
    </section>
  );
}
