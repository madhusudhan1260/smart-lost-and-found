import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useMode } from '../context/ModeContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { STATUS } from '../data/constants';
import { getClaimStats, getItemStats, getRecentItems, getTopMatchPairs } from '../utils/statistics';
import { cx } from '../utils/helpers';
import logo from '../assets/logo.svg';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import ItemCard from '../components/ItemCard';
import ClaimCard from '../components/ClaimCard';
import StatusBadge from '../components/StatusBadge';
import TipTicker from '../components/TipTicker';
import DashboardCard from '../components/DashboardCard';
import MatchPairList from '../components/MatchPairList';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { SkeletonGrid } from '../components/LoadingSpinner';

function RecentSection({ title, icon, type, items, loading }) {
  return (
    <section className="section">
      <div className="section__head">
        <h2><Icon name={icon} className={`tone-text--${type === 'lost' ? 'blue' : 'green'}`} /> {title}</h2>
        <Link to={`/${type}`} className="link-arrow">View all <Icon name="arrow_forward" /></Link>
      </div>
      {loading ? (
        <SkeletonGrid count={4} />
      ) : items.length ? (
        <div className="item-grid">
          {items.map((item, index) => <ItemCard key={item.id} item={item} index={index} />)}
        </div>
      ) : (
        <EmptyState title={`No ${type} items found.`} />
      )}
    </section>
  );
}

export default function Home() {
  useDocumentTitle('Home');
  const { items, claims, myClaims, loading } = useItems();
  const { isDoss } = useMode();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchIn, setSearchIn] = useState('found');

  const itemStats = useMemo(() => getItemStats(items), [items]);
  const claimStats = useMemo(() => getClaimStats(claims), [claims]);
  const recentLost = useMemo(() => getRecentItems(items.filter((item) => item.type === 'lost'), 4), [items]);
  const recentFound = useMemo(() => getRecentItems(items.filter((item) => item.type === 'found'), 4), [items]);
  const matchPairs = useMemo(() => getTopMatchPairs(items, 4), [items]);
  const pendingClaims = claims.filter((claim) => claim.status === STATUS.CLAIM_PENDING);

  const handleSearch = (text) => navigate(`/${searchIn}?q=${encodeURIComponent(text.trim())}`);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <img src={logo} alt="" className="hero__logo" width="72" height="72" />
          <h1 className="hero__title">
            <span className="c-blue">Smart</span> <span className="c-red">Lost</span>{' '}
            <span className="c-yellow">&amp;</span> <span className="c-green">Found</span>
          </h1>
          <p className="hero__subtitle">
            Lost something? Found something?<br />Let’s help return it to its owner.
          </p>

          <div className="hero__search">
            <SearchBar id="home-search" large value={query} onChange={setQuery} onSubmit={handleSearch}
              placeholder={`Search ${searchIn} items – e.g. “black phone library”`} />
            <div className="hero__search-scope" role="group" aria-label="Search in">
              {['found', 'lost'].map((type) => (
                <button key={type} type="button" className={cx('chip chip--toggle', searchIn === type && 'is-active')}
                  onClick={() => setSearchIn(type)} aria-pressed={searchIn === type}>
                  {type === 'found' ? 'Found items' : 'Lost items'}
                </button>
              ))}
            </div>
          </div>

          <div className="hero__actions">
            {isDoss ? (
              <>
                <Link to="/doss/claims" className="btn btn--primary btn--lg">
                  <Icon name="fact_check" /> Review pending claims ({claimStats.pending})
                </Link>
                <Link to="/dashboard" className="btn btn--outline btn--lg">
                  <Icon name="space_dashboard" /> DOSS dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/report-lost" className="btn btn--primary btn--lg"><Icon name="search" /> Report Lost Item</Link>
                <Link to="/report-found" className="btn btn--outline btn--lg"><Icon name="inventory_2" /> Report Found Item</Link>
              </>
            )}
          </div>
          <TipTicker />
        </div>
      </section>

      <div className="container page-body">
        <section className="stat-grid" aria-label="Statistics">
          <StatCard label="Lost Items" value={itemStats.lost} icon="search" tone="blue" to="/lost" />
          <StatCard label="Found Items" value={itemStats.found} icon="inventory_2" tone="green" to="/found" />
          <StatCard label="Claims Pending" value={claimStats.pending} icon="hourglass_top" tone="yellow"
            to={isDoss ? '/doss/claims' : undefined} />
          <StatCard label="Resolved Items" value={itemStats.resolved} icon="task_alt" tone="red" to="/resolved" />
        </section>

        <RecentSection title="Recent Lost Items" icon="search" type="lost" items={recentLost} loading={loading} />
        <RecentSection title="Recent Found Items" icon="inventory_2" type="found" items={recentFound} loading={loading} />

        <div className="two-col section">
          <DashboardCard title="Possible Matches" icon="join_inner" action="Smart Match" actionTo="/smart-match">
            <MatchPairList pairs={matchPairs} />
          </DashboardCard>

          {isDoss ? (
            <DashboardCard title="Pending Claims" icon="fact_check" action="All claims" actionTo="/doss/claims">
              {pendingClaims.length ? (
                <div className="claim-rows">
                  {pendingClaims.slice(0, 4).map((claim, index) => <ClaimCard key={claim.id} claim={claim} view="doss" index={index} />)}
                </div>
              ) : (
                <p className="muted">No pending claims.</p>
              )}
            </DashboardCard>
          ) : (
            <DashboardCard title="My Claims" icon="assignment_ind" action="Track claims" actionTo="/my-claims">
              {myClaims.length ? (
                <ul className="mini-claims">
                  {myClaims.slice(0, 4).map((claim) => {
                    const item = items.find((entry) => entry.id === claim.itemId);
                    return (
                      <li key={claim.id}>
                        <Link to="/my-claims" className="mini-claim">
                          <span><strong>{item?.name ?? 'Deleted item'}</strong><small className="muted">{claim.id}</small></span>
                          <StatusBadge status={claim.status === STATUS.CLAIM_ACCEPTED ? STATUS.READY_FOR_COLLECTION : claim.status} size="sm" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="muted">You have not claimed any items yet.</p>
              )}
            </DashboardCard>
          )}
        </div>
      </div>
    </>
  );
}
