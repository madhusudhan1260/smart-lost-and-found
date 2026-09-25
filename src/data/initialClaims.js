// Sample ownership claims in different stages, so the DOSS dashboard
// looks realistic the first time it is opened.
import { daysAgoISO, isoDaysAgo, isoHoursAgo } from '../utils/dateUtils';

const initialClaims = [
  {
    id: 'CL-3001', itemId: 'LF-2002', lostItemId: 'LF-1002', status: 'CLAIM_PENDING',
    claimantName: 'Priya Nair', rollNumber: '22CSE045', contact: '9876543210',
    reason: 'It is my college ID card. I lost it in the CSE Block yesterday morning.',
    uniqueFeature: 'The lanyard has a small Eiffel Tower keychain, and my roll number is 22CSE045.',
    lostLocation: 'CSE Block', lostDate: daysAgoISO(1),
    additionalProof: 'I can show my fee receipt with the same roll number.',
    createdAt: isoHoursAgo(20),
  },
  {
    id: 'CL-3002', itemId: 'LF-2003', lostItemId: 'LF-1003', status: 'CLAIM_ACCEPTED',
    claimantName: 'Arjun Reddy', rollNumber: '21ME023', contact: 'arjun.reddy@college.edu',
    reason: 'I removed my watch during football practice and forgot to pick it up.',
    uniqueFeature: 'The back of the watch is engraved with my initials "A.R.".',
    lostLocation: 'Sports Ground', lostDate: daysAgoISO(4),
    additionalProof: 'I still have the original box at the hostel.',
    createdAt: isoDaysAgo(2), reviewedAt: isoDaysAgo(1), acceptedAt: isoDaysAgo(1),
    reviewNote: 'Engraving matches the finder’s private note.',
  },
  {
    id: 'CL-3003', itemId: 'LF-2004', lostItemId: null, status: 'CLAIM_REJECTED',
    claimantName: 'Manoj Kumar', rollNumber: '23EC019', contact: '9000011111',
    reason: 'I lost my wallet somewhere in the cafeteria.',
    uniqueFeature: 'It is a black wallet with my Aadhaar card inside.',
    lostLocation: 'Cafeteria', lostDate: daysAgoISO(3),
    additionalProof: '',
    createdAt: isoDaysAgo(2), reviewedAt: isoDaysAgo(1),
    reviewNote: 'The colour and contents do not match the found wallet.',
  },
  {
    id: 'CL-3004', itemId: 'LF-2005', lostItemId: 'LF-1005', status: 'COLLECTED',
    claimantName: 'Vikram Singh', rollNumber: '22CSE101', contact: 'vikram.singh@college.edu',
    reason: 'It is my DSA textbook with my own notes.',
    uniqueFeature: 'My name "Vikram S" is written on page 1 and chapter 5 is highlighted in yellow.',
    lostLocation: 'Library', lostDate: daysAgoISO(6),
    additionalProof: '',
    createdAt: isoDaysAgo(5), reviewedAt: isoDaysAgo(4), acceptedAt: isoDaysAgo(4),
    collectedAt: isoDaysAgo(3), reviewNote: 'Name on page 1 verified.',
  },
  {
    id: 'CL-3005', itemId: 'LF-2006', lostItemId: 'LF-1006', status: 'RESOLVED',
    claimantName: 'Karthik Rao', rollNumber: '22ME077', contact: '9988776655',
    reason: 'These are my Honda bike keys.',
    uniqueFeature: 'The keychain has a bottle opener and a KA-05 tag.',
    lostLocation: 'Parking Area', lostDate: daysAgoISO(8),
    additionalProof: 'I can bring the bike registration card.',
    createdAt: isoDaysAgo(7), reviewedAt: isoDaysAgo(6), acceptedAt: isoDaysAgo(6),
    collectedAt: isoDaysAgo(6), resolvedAt: isoDaysAgo(6), reviewNote: 'Tag verified.',
  },
  {
    id: 'CL-3006', itemId: 'LF-2007', lostItemId: 'LF-1007', status: 'CLAIM_PENDING',
    claimantName: 'Ananya Iyer', rollNumber: '22CSE012', contact: 'ananya.iyer@college.edu',
    reason: 'I left my backpack in the auditorium after the tech fest.',
    uniqueFeature: 'There is a Dell laptop charger in the front pocket and a blue pencil box with stickers.',
    lostLocation: 'Auditorium', lostDate: daysAgoISO(5),
    additionalProof: 'My notebooks inside have my name on the cover.',
    createdAt: isoDaysAgo(2),
  },
  {
    id: 'CL-3007', itemId: 'LF-2008', lostItemId: 'LF-1009', status: 'CLAIM_PENDING',
    claimantName: 'Meera Joshi', rollNumber: '22IS054', contact: 'meera.joshi@college.edu',
    reason: 'It is my Dell laptop. I forgot it after the afternoon lab session.',
    uniqueFeature: 'There is a rocket sticker near the touchpad and the E key is missing.',
    lostLocation: 'Computer Lab', lostDate: daysAgoISO(1),
    additionalProof: 'I can unlock it with my password in front of DOSS staff.',
    createdAt: isoHoursAgo(5),
  },
];

// Claims that "this browser" submitted – shown on the My Claims page at first
export const DEMO_MY_CLAIM_IDS = ['CL-3002', 'CL-3003'];

export default initialClaims;
