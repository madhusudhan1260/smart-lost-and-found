// File: src/context/ItemContext.jsx
// Purpose: Shared items + claims state, loaded from and saved to the Express API.
// Used by: components/ClaimCard.jsx, components/ClaimForm.jsx, components/ItemForm.jsx,
//          components/ItemsBrowser.jsx, components/Navbar.jsx, main.jsx, pages/ClaimItem.jsx,
//          pages/ClaimReview.jsx, pages/DossClaims.jsx, pages/DossDashboard.jsx, pages/Home.jsx,
//          pages/ItemDetails.jsx, pages/MyClaims.jsx, pages/ResolvedItems.jsx,
//          pages/SmartMatch.jsx, pages/StudentDashboard.jsx

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as itemService from '../services/itemService';
import useLocalStorage from '../hooks/useLocalStorage';
import { DEMO_MY_CLAIM_IDS, STORAGE_KEYS } from '../data/constants';
import { canBeClaimed } from '../utils/claimUtils';
import { mergeUpdates } from '../utils/helpers';
import { useAuth } from './AuthContext';

// Shared item + claim data for every page (no prop drilling through the whole tree).
// The data comes from the Express API, which stores it in MongoDB.
const ItemContext = createContext(null);

export function ItemProvider({ children }) {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  // IDs of claims submitted from THIS browser (students have no account, so this is "my claims")
  const [myClaimIds, setMyClaimIds] = useLocalStorage(STORAGE_KEYS.MY_CLAIMS, DEMO_MY_CLAIM_IDS);

  // GET /api/items and GET /api/claims at the same time.
  // Logged-in DOSS staff receive private details and full claims; everyone else the public view.
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemData, claimData] = await Promise.all([itemService.getItems(), itemService.getClaims()]);
      setItems(itemData);
      setClaims(claimData);
    } catch (err) {
      setError(err?.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on start, and again after logging in or out (the server returns different fields)
  useEffect(() => {
    loadData();
  }, [loadData, isLoggedIn]);

  // The server answers workflow requests with { items, claims } – the documents that changed
  const applyChanges = useCallback(({ items: changedItems = [], claims: changedClaims = [] }) => {
    setItems((previous) => mergeUpdates(previous, changedItems));
    setClaims((previous) => mergeUpdates(previous, changedClaims));
    return { updatedItems: changedItems, updatedClaims: changedClaims };
  }, []);

  // ---------------- REPORTS ----------------

  const addItem = useCallback(async (itemData) => {
    const newItem = await itemService.addItem(itemData); // POST /api/items
    setItems((previous) => [newItem, ...previous]);
    return newItem;
  }, []);

  const deleteItem = useCallback(async (id) => {
    await itemService.deleteItem(id); // DELETE /api/items/:id (DOSS)
    setItems((previous) => previous.filter((item) => item.id !== id));
    setClaims((previous) => previous.filter((claim) => claim.itemId !== id));
  }, []);

  // ---------------- CLAIM WORKFLOW (rules are enforced by the server) ----------------

  // STEP 3 – a student says "This is my item"   POST /api/claims
  const submitClaim = useCallback(
    async (item, claimData) => {
      if (!canBeClaimed(item)) throw new Error('This item can no longer be claimed.'); // quick check before the request
      const { claim, items: changedItems } = await itemService.addClaim({ ...claimData, itemId: item.id });
      setClaims((previous) => [claim, ...previous]);
      setItems((previous) => mergeUpdates(previous, changedItems));
      setMyClaimIds((previous) => [claim.id, ...previous]);
      return claim;
    },
    [setMyClaimIds],
  );

  // STEP 5 – DOSS accepts or rejects   POST /api/claims/:id/accept | /reject
  const acceptClaim = useCallback(
    async (claimId, reviewNote = '') => applyChanges(await itemService.acceptClaim(claimId, reviewNote)),
    [applyChanges],
  );

  const rejectClaim = useCallback(
    async (claimId, reviewNote) => applyChanges(await itemService.rejectClaim(claimId, reviewNote)),
    [applyChanges],
  );

  // STEP 6 – collected at the DOSS office, then the case is closed   POST /api/items/:id/collect | /resolve
  const markCollected = useCallback(
    async (itemId) => applyChanges(await itemService.markCollected(itemId)),
    [applyChanges],
  );

  const markResolved = useCallback(
    async (itemId) => applyChanges(await itemService.markResolved(itemId)),
    [applyChanges],
  );

  // Let a student follow a claim made on another device (by claim ID)
  const trackClaim = useCallback(
    (claimId) => setMyClaimIds((previous) => (previous.includes(claimId) ? previous : [claimId, ...previous])),
    [setMyClaimIds],
  );

  // DOSS only: POST /api/admin/reset puts the sample data back into MongoDB
  const resetData = useCallback(async () => {
    await itemService.resetAllData();
    setMyClaimIds(DEMO_MY_CLAIM_IDS);
    await loadData();
  }, [loadData, setMyClaimIds]);

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
