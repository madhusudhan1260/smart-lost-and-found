// File: src/context/ItemContext.jsx
// Purpose: Shared items + claims state and the whole claim workflow.
// Used by: components/ClaimCard.jsx, components/ClaimForm.jsx, components/ItemForm.jsx,
//          components/ItemsBrowser.jsx, components/Navbar.jsx, main.jsx, pages/ClaimItem.jsx,
//          pages/ClaimReview.jsx, pages/DossClaims.jsx, pages/DossDashboard.jsx, pages/Home.jsx,
//          pages/ItemDetails.jsx, pages/MyClaims.jsx, pages/ResolvedItems.jsx,
//          pages/SmartMatch.jsx, pages/StudentDashboard.jsx

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as itemService from '../services/itemService';
import useLocalStorage from '../hooks/useLocalStorage';
import { STATUS, STORAGE_KEYS } from '../data/constants';
import { DEMO_MY_CLAIM_IDS } from '../data/initialClaims';
import { canBeClaimed, statusAfterRejection } from '../utils/claimUtils';
import { mergeUpdates } from '../utils/helpers';

// Shared item + claim data for every page (no prop drilling through the whole tree)
const ItemContext = createContext(null);

const now = () => new Date().toISOString();

export function ItemProvider({ children }) {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // IDs of claims submitted from THIS browser (there is no login, so this is "my claims")
  const [myClaimIds, setMyClaimIds] = useLocalStorage(STORAGE_KEYS.MY_CLAIMS, DEMO_MY_CLAIM_IDS);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load items and claims at the same time
      const [itemData, claimData] = await Promise.all([itemService.getItems(), itemService.getClaims()]);
      setItems(itemData);
      setClaims(claimData);
    } catch (err) {
      setError(err?.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Wait for several service updates, then put the new versions into state
  const commit = useCallback(async ({ itemUpdates = [], claimUpdates = [] }) => {
    const [updatedItems, updatedClaims] = await Promise.all([
      Promise.all(itemUpdates),
      Promise.all(claimUpdates),
    ]);
    setItems((previous) => mergeUpdates(previous, updatedItems));
    setClaims((previous) => mergeUpdates(previous, updatedClaims));
    return { updatedItems, updatedClaims };
  }, []);

  // ---------------- REPORTS ----------------

  const addItem = useCallback(async (itemData) => {
    const newItem = await itemService.addItem(itemData);
    setItems((previous) => [newItem, ...previous]);
    return newItem;
  }, []);

  const deleteItem = useCallback(async (id) => {
    await itemService.deleteItem(id);
    setItems((previous) => previous.filter((item) => item.id !== id));
  }, []);

  // ---------------- CLAIM WORKFLOW ----------------

  // STEP 3 – a student says "This is my item"
  const submitClaim = useCallback(
    async (item, claimData) => {
      if (!canBeClaimed(item)) throw new Error('This item can no longer be claimed.');

      const alreadyClaimed = claims.some(
        (claim) =>
          claim.itemId === item.id &&
          claim.status === STATUS.CLAIM_PENDING &&
          claim.contact.toLowerCase() === claimData.contact.toLowerCase(),
      );
      if (alreadyClaimed) throw new Error('You already have a pending claim for this item.');

      const newClaim = await itemService.addClaim({ ...claimData, itemId: item.id });
      setClaims((previous) => [newClaim, ...previous]);
      setMyClaimIds((previous) => [newClaim.id, ...previous]);

      await commit({
        itemUpdates: [
          itemService.updateItem(item.id, { status: STATUS.CLAIM_PENDING }),
          ...(claimData.lostItemId ? [itemService.updateItem(claimData.lostItemId, { status: STATUS.CLAIM_PENDING })] : []),
        ],
      });
      return newClaim;
    },
    [claims, commit, setMyClaimIds],
  );

  const findPendingClaim = useCallback(
    (claimId) => {
      const claim = claims.find((entry) => entry.id === claimId);
      if (!claim) throw new Error(`Claim "${claimId}" was not found.`);
      if (claim.status !== STATUS.CLAIM_PENDING) throw new Error('This claim has already been reviewed.');
      return claim;
    },
    [claims],
  );

  // STEP 5 – DOSS accepts: item becomes READY_FOR_COLLECTION,
  // any other pending claims for the same item are rejected automatically.
  const acceptClaim = useCallback(
    async (claimId, reviewNote = '') => {
      const claim = findPendingClaim(claimId);
      const time = now();
      const competing = claims.filter(
        (entry) => entry.itemId === claim.itemId && entry.id !== claim.id && entry.status === STATUS.CLAIM_PENDING,
      );

      return commit({
        claimUpdates: [
          itemService.updateClaim(claim.id, { status: STATUS.CLAIM_ACCEPTED, reviewedAt: time, acceptedAt: time, reviewNote }),
          ...competing.map((entry) =>
            itemService.updateClaim(entry.id, {
              status: STATUS.CLAIM_REJECTED,
              reviewedAt: time,
              reviewNote: 'Another claim for this item was verified by DOSS.',
            }),
          ),
        ],
        itemUpdates: [
          itemService.updateItem(claim.itemId, { status: STATUS.READY_FOR_COLLECTION, claimId: claim.id }),
          ...(claim.lostItemId ? [itemService.updateItem(claim.lostItemId, { status: STATUS.READY_FOR_COLLECTION })] : []),
          ...competing
            .filter((entry) => entry.lostItemId)
            .map((entry) => itemService.updateItem(entry.lostItemId, { status: STATUS.LOST })),
        ],
      });
    },
    [claims, commit, findPendingClaim],
  );

  const rejectClaim = useCallback(
    async (claimId, reviewNote) => {
      const claim = findPendingClaim(claimId);
      return commit({
        claimUpdates: [
          itemService.updateClaim(claim.id, { status: STATUS.CLAIM_REJECTED, reviewedAt: now(), reviewNote }),
        ],
        itemUpdates: [
          itemService.updateItem(claim.itemId, { status: statusAfterRejection(claim.itemId, claims, claim.id) }),
          ...(claim.lostItemId ? [itemService.updateItem(claim.lostItemId, { status: STATUS.LOST })] : []),
        ],
      });
    },
    [claims, commit, findPendingClaim],
  );

  // STEP 6 – the owner picked the item up from the DOSS office
  const markCollected = useCallback(
    async (itemId) => {
      const claim = claims.find((entry) => entry.itemId === itemId && entry.status === STATUS.CLAIM_ACCEPTED);
      if (!claim) throw new Error('There is no accepted claim for this item.');
      const time = now();

      return commit({
        claimUpdates: [itemService.updateClaim(claim.id, { status: STATUS.COLLECTED, collectedAt: time })],
        itemUpdates: [
          itemService.updateItem(itemId, { status: STATUS.COLLECTED, collectedAt: time }),
          ...(claim.lostItemId ? [itemService.updateItem(claim.lostItemId, { status: STATUS.COLLECTED, collectedAt: time })] : []),
        ],
      });
    },
    [claims, commit],
  );

  // Close the case. Works for collected found items and for lost reports.
  const markResolved = useCallback(
    async (itemId) => {
      const time = now();
      const claim = claims.find((entry) => entry.itemId === itemId && entry.status === STATUS.COLLECTED);

      return commit({
        itemUpdates: [
          itemService.updateItem(itemId, { status: STATUS.RESOLVED, resolvedAt: time }),
          ...(claim?.lostItemId ? [itemService.updateItem(claim.lostItemId, { status: STATUS.RESOLVED, resolvedAt: time })] : []),
        ],
        claimUpdates: claim ? [itemService.updateClaim(claim.id, { status: STATUS.RESOLVED, resolvedAt: time })] : [],
      });
    },
    [claims, commit],
  );

  // Let a student follow a claim made on another device (by claim ID)
  const trackClaim = useCallback(
    (claimId) => setMyClaimIds((previous) => (previous.includes(claimId) ? previous : [claimId, ...previous])),
    [setMyClaimIds],
  );

  const resetData = useCallback(async () => {
    const data = await itemService.resetAllData();
    setItems(data.items);
    setClaims(data.claims);
    setMyClaimIds(DEMO_MY_CLAIM_IDS);
  }, [setMyClaimIds]);

  // ---------------- LOOK-UPS ----------------

  const getItemById = useCallback((id) => items.find((item) => item.id === id), [items]);
  const getClaimById = useCallback((id) => claims.find((claim) => claim.id === id), [claims]);
  const getClaimsForItem = useCallback(
    (itemId) => claims.filter((claim) => claim.itemId === itemId || claim.lostItemId === itemId),
    [claims],
  );

  const myClaims = useMemo(
    () => myClaimIds.map((id) => claims.find((claim) => claim.id === id)).filter(Boolean),
    [myClaimIds, claims],
  );

  // useMemo: consumers only re-render when something in here actually changes
  const value = useMemo(
    () => ({
      items, claims, myClaims, loading, error,
      reload: loadData,
      addItem, deleteItem,
      submitClaim, acceptClaim, rejectClaim, markCollected, markResolved, trackClaim, resetData,
      getItemById, getClaimById, getClaimsForItem,
    }),
    [
      items, claims, myClaims, loading, error, loadData, addItem, deleteItem,
      submitClaim, acceptClaim, rejectClaim, markCollected, markResolved, trackClaim, resetData,
      getItemById, getClaimById, getClaimsForItem,
    ],
  );

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
}

// Custom hook so components write useItems() instead of useContext(ItemContext)
export function useItems() {
  const context = useContext(ItemContext);
  if (!context) throw new Error('useItems() must be used inside <ItemProvider>');
  return context;
}
