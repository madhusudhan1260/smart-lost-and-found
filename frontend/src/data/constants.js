// File: src/data/constants.js
// Used by: components/claims/ClaimCard.jsx, components/claims/ClaimForm.jsx,
//          components/claims/CollectionInstructions.jsx, components/items/FilterPanel.jsx,
//          components/layout/Footer.jsx, components/items/ItemForm.jsx, components/items/ItemImage.jsx,
//          components/items/ItemsBrowser.jsx, components/layout/ModeGate.jsx, components/layout/ModeSwitcher.jsx,
//          components/layout/Navbar.jsx, components/ui/StatusBadge.jsx, context/ItemContext.jsx,
//          context/ModeContext.jsx, pages/student/ClaimItem.jsx, pages/doss/ClaimReview.jsx,
//          pages/doss/DossClaims.jsx, pages/doss/DossDashboard.jsx, pages/public/Home.jsx, pages/public/ItemDetails.jsx,
//          pages/student/MyClaims.jsx, pages/student/ReportFound.jsx, pages/student/ReportLost.jsx,
//          pages/public/ResolvedItems.jsx, pages/public/SmartMatch.jsx, pages/student/StudentDashboard.jsx,
//          services/itemService.js, utils/claimUtils.js, utils/helpers.js, utils/matching.js,
//          utils/statistics.js
// Shared constants used across the whole app.
// Keeping them in one module means a category, location or status is only spelled once.

export const CATEGORIES = [
  'Electronics',
  'Books',
  'ID Cards',
  'Wallets',
  'Bags',
  'Keys',
  'Watches',
  'Documents',
  'Accessories',
  'Other',
];

// Material Symbols icon name + accent colour for every category
export const CATEGORY_META = {
  Electronics: { icon: 'smartphone', color: '#4285F4' },
  Books: { icon: 'menu_book', color: '#FBBC05' },
  'ID Cards': { icon: 'badge', color: '#34A853' },
  Wallets: { icon: 'account_balance_wallet', color: '#EA4335' },
  Bags: { icon: 'backpack', color: '#4285F4' },
  Keys: { icon: 'key', color: '#FBBC05' },
  Watches: { icon: 'watch', color: '#34A853' },
  Documents: { icon: 'description', color: '#5F6368' },
  Accessories: { icon: 'headphones', color: '#EA4335' },
  Other: { icon: 'category', color: '#5F6368' },
};

// A more specific icon when the item name contains one of these words
export const NAME_ICONS = [
  { pattern: /charger|adapter|cable/i, icon: 'power' },
  { pattern: /laptop|macbook|notebook pc/i, icon: 'laptop_mac' },
  { pattern: /bottle|flask/i, icon: 'water_bottle' },
  { pattern: /umbrella/i, icon: 'umbrella' },
  { pattern: /earphone|earbud|airdopes|headphone/i, icon: 'headphones' },
  { pattern: /calculator/i, icon: 'calculate' },
  { pattern: /pen ?drive|usb|flash drive/i, icon: 'usb' },
  { pattern: /spectacle|glasses|specs/i, icon: 'eyeglasses' },
  { pattern: /keychain|key ring/i, icon: 'vpn_key' },
  { pattern: /id card|smart card|usn card|college id/i, icon: 'badge' },
  { pattern: /smartwatch|fitness band|fitbit/i, icon: 'watch' },
  { pattern: /notebook|textbook|register|diary/i, icon: 'menu_book' },
  { pattern: /backpack|tote bag|duffle/i, icon: 'backpack' },
  { pattern: /purse|pouch/i, icon: 'account_balance_wallet' },
  { pattern: /helmet/i, icon: 'two_wheeler' },
];

export const LOCATIONS = [
  'Main Block',
  'Library',
  'Cafeteria',
  'Computer Lab',
  'CSE Block',
  'Auditorium',
  'Sports Ground',
  'Parking Area',
  'Hostel',
  'Seminar Hall',
  'Laboratory',
  'Administration Block',
  'DOSS Office',
];

// Places that are physically close to each other on campus.
// Smart Match gives half the location points for a nearby place.
export const NEARBY_LOCATIONS = {
  'Main Block': ['Administration Block', 'Cafeteria', 'Seminar Hall', 'Library', 'DOSS Office'],
  Library: ['CSE Block', 'Main Block', 'Seminar Hall'],
  Cafeteria: ['Main Block', 'Hostel', 'Sports Ground'],
  'Computer Lab': ['CSE Block', 'Laboratory'],
  'CSE Block': ['Computer Lab', 'Library', 'Laboratory'],
  Auditorium: ['Seminar Hall', 'Administration Block', 'Parking Area'],
  'Sports Ground': ['Hostel', 'Parking Area', 'Cafeteria'],
  'Parking Area': ['Sports Ground', 'Administration Block', 'Auditorium'],
  Hostel: ['Cafeteria', 'Sports Ground'],
  'Seminar Hall': ['Auditorium', 'Main Block', 'Library'],
  Laboratory: ['CSE Block', 'Computer Lab'],
  'Administration Block': ['Main Block', 'Auditorium', 'Parking Area', 'DOSS Office'],
  'DOSS Office': ['Administration Block', 'Main Block'],
};

export const MODES = { STUDENT: 'student', DOSS: 'doss' };

// Account roles (same as the API). Staff roles can open the DOSS interface.
export const ROLES = { STUDENT: 'student', DOSS: 'doss', SUPER_ADMIN: 'superadmin' };
export const STAFF_ROLES = [ROLES.DOSS, ROLES.SUPER_ADMIN];

export const ROLE_META = {
  student: { label: 'Student', icon: 'school', tone: 'blue' },
  doss: { label: 'DOSS staff', icon: 'shield_person', tone: 'green' },
  superadmin: { label: 'Super Admin', icon: 'admin_panel_settings', tone: 'red' },
};

// Demo accounts created by `npm run seed` (documented in the README – demo data only)
export const DEMO_ACCOUNTS = {
  student: { email: 'student@college.edu', password: 'Student@123' },
  doss: { email: 'doss@college.edu', password: 'Doss@123' },
  superadmin: { email: 'admin@college.edu', password: 'Admin@123' },
};

// Every status an item or a claim can have
export const STATUS = {
  LOST: 'LOST',
  FOUND: 'FOUND',
  CLAIM_PENDING: 'CLAIM_PENDING',
  CLAIM_ACCEPTED: 'CLAIM_ACCEPTED',
  CLAIM_REJECTED: 'CLAIM_REJECTED',
  READY_FOR_COLLECTION: 'READY_FOR_COLLECTION',
  COLLECTED: 'COLLECTED',
  RESOLVED: 'RESOLVED',
};

// How each status is shown: label, colour tone, icon and a one-line explanation (tooltip)
export const STATUS_META = {
  LOST: { label: 'Lost', tone: 'blue', icon: 'search', hint: 'The owner is still looking for it' },
  FOUND: { label: 'Found', tone: 'green', icon: 'inventory_2', hint: 'Waiting for its owner to claim it' },
  CLAIM_PENDING: { label: 'Claim pending', tone: 'yellow', icon: 'hourglass_top', hint: 'The DOSS office is checking an ownership claim' },
  CLAIM_ACCEPTED: { label: 'Claim accepted', tone: 'green', icon: 'verified', hint: 'Ownership was verified by DOSS' },
  CLAIM_REJECTED: { label: 'Claim rejected', tone: 'red', icon: 'block', hint: 'DOSS could not verify ownership' },
  READY_FOR_COLLECTION: { label: 'Ready for collection', tone: 'blue', icon: 'storefront', hint: 'The owner can pick it up at the DOSS office' },
  COLLECTED: { label: 'Collected', tone: 'green', icon: 'handshake', hint: 'The owner has picked it up' },
  RESOLVED: { label: 'Resolved', tone: 'green', icon: 'task_alt', hint: 'The case is closed' },
};

// Which statuses can appear in the filter dropdown of each list
export const STATUS_OPTIONS_BY_TYPE = {
  lost: [STATUS.LOST, STATUS.CLAIM_PENDING, STATUS.READY_FOR_COLLECTION, STATUS.COLLECTED, STATUS.RESOLVED],
  found: [STATUS.FOUND, STATUS.CLAIM_PENDING, STATUS.READY_FOR_COLLECTION, STATUS.COLLECTED, STATUS.RESOLVED],
};

export const ITEM_LOCATIONS_NOW = ['Handed over to DOSS Office', 'With the finder'];

// Browser storage keys. Reports and claims now live in MongoDB (via the API),
// so only small per-browser settings are kept here.
export const STORAGE_KEYS = {
  TOKEN: 'lf_v2_token',
  THEME: 'lf_v2_theme',
  MATCH_THRESHOLD: 'lf_v2_match_threshold',
  LAST_LOGIN: 'lf_v2_last_login', // { role, email } of the last successful sign-in (never the password)
  MODE: 'lf_v2_mode',
  MY_CLAIMS: 'lf_v2_my_claims',
  DRAFT_PREFIX: 'lf_v2_draft_',
  FILTERS_PREFIX: 'lf_v2_filters_',
  VIEW: 'lf_v2_view',
  RECENT: 'lf_v2_recent',
};

export const DATE_RANGES = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'older', label: 'Older than 30 days' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
];

export const DOSS_OFFICE = {
  place: 'DOSS Office, Ground Floor, Administration Block',
  hours: 'Monday – Saturday, 9:30 AM – 4:30 PM',
  phone: '080-2345 6789',
  // Machine-readable opening hours for the "Open now" label (0 = Sunday)
  openDays: [1, 2, 3, 4, 5, 6],
  opensAt: 9.5, // 9:30 AM
  closesAt: 16.5, // 4:30 PM
};

// Matches below this percentage are hidden by default
export const DEFAULT_MATCH_THRESHOLD = 35;

// Sample claims that "this browser" made – shown on My Claims for the demo
export const DEMO_MY_CLAIM_IDS = ['CL-3002', 'CL-3003'];
