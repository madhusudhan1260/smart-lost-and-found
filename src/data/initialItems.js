// 25 sample reports, loaded on the very first visit (when localStorage is empty).
// Dates are calculated relative to TODAY so the demo always looks fresh.
//
// `privateDetails` is NEVER shown on public pages. Only DOSS sees it,
// and uses it to check whether a claimant is the real owner.
import { daysAgoISO, isoDaysAgo } from '../utils/dateUtils';

// Build one report. Every item has the same shape.
function createSeedItem({ id, type, daysAgo, time, handedTo, extra = {}, ...details }) {
  const date = daysAgoISO(daysAgo);
  return {
    id,
    type,
    ...details, // SPREAD: name, category, colour, location, description, contact...
    date,
    time,
    image: null, // no photo → a category icon is shown instead
    additionalInfo: details.additionalInfo ?? '',
    ...(type === 'found' ? { handedTo: handedTo ?? 'Handed over to DOSS Office' } : {}),
    createdAt: new Date(`${date}T${time}`).toISOString(),
    ...extra, // collectedAt / resolvedAt for finished cases
  };
}

const seedData = [
  // ================= LOST REPORTS =================
  {
    id: 'LF-1001', type: 'lost', daysAgo: 2, time: '14:30', status: 'LOST',
    name: 'iPhone 15', category: 'Electronics', color: 'Black', location: 'Library',
    description: 'Black iPhone 15 with a transparent case.',
    privateDetails: 'There are three small scratches on the bottom-right corner of the back case. Lock screen wallpaper is a golden retriever.',
    contactName: 'Rahul Sharma', contact: 'rahul.sharma@college.edu',
  },
  {
    id: 'LF-1002', type: 'lost', daysAgo: 1, time: '10:15', status: 'CLAIM_PENDING',
    name: 'Student ID Card', category: 'ID Cards', color: 'Blue', location: 'CSE Block',
    description: 'College ID card on a blue lanyard, 3rd year CSE.',
    privateDetails: 'Roll number 22CSE045. A small Eiffel Tower keychain is attached to the lanyard.',
    contactName: 'Priya Nair', contact: '9876543210',
  },
  {
    id: 'LF-1003', type: 'lost', daysAgo: 4, time: '17:45', status: 'READY_FOR_COLLECTION',
    name: 'Casio Digital Watch', category: 'Watches', color: 'Silver', location: 'Sports Ground',
    description: 'Silver Casio digital watch with a metal strap. Removed it during football practice.',
    privateDetails: 'The back of the watch is engraved with the initials "A.R." and the strap has a deep scratch near the buckle.',
    contactName: 'Arjun Reddy', contact: 'arjun.reddy@college.edu',
  },
  {
    id: 'LF-1004', type: 'lost', daysAgo: 3, time: '13:10', status: 'LOST',
    name: 'Leather Wallet', category: 'Wallets', color: 'Brown', location: 'Cafeteria',
    description: 'Brown leather wallet with cards and some cash inside.',
    privateDetails: 'Contains a bus pass in the name Sneha K and a small photo of a cat.',
    contactName: 'Sneha Kulkarni', contact: '9123456780',
  },
  {
    id: 'LF-1005', type: 'lost', daysAgo: 6, time: '11:00', status: 'COLLECTED',
    name: 'Data Structures Textbook', category: 'Books', color: 'Blue', location: 'Library',
    description: 'Data Structures and Algorithms textbook by Narasimha Karumanchi with notes.',
    privateDetails: 'Name "Vikram S" written on page 1 and chapter 5 is highlighted in yellow.',
    contactName: 'Vikram Singh', contact: 'vikram.singh@college.edu',
    extra: { collectedAt: isoDaysAgo(3) },
  },
  {
    id: 'LF-1006', type: 'lost', daysAgo: 8, time: '09:20', status: 'RESOLVED',
    name: 'Bike Keys', category: 'Keys', color: 'Silver', location: 'Parking Area',
    description: 'Honda bike keys on a red keychain.',
    privateDetails: 'The keychain has a small bottle opener and a KA-05 tag.',
    contactName: 'Karthik Rao', contact: '9988776655',
    extra: { collectedAt: isoDaysAgo(6), resolvedAt: isoDaysAgo(6) },
  },
  {
    id: 'LF-1007', type: 'lost', daysAgo: 5, time: '16:00', status: 'CLAIM_PENDING',
    name: 'Wildcraft Backpack', category: 'Bags', color: 'Black', location: 'Auditorium',
    description: 'Black Wildcraft backpack with notebooks and a water bottle.',
    privateDetails: 'Front pocket has a Dell laptop charger and a blue pencil box with stickers.',
    contactName: 'Ananya Iyer', contact: 'ananya.iyer@college.edu',
  },
  {
    id: 'LF-1008', type: 'lost', daysAgo: 9, time: '20:30', status: 'LOST',
    name: 'boAt Wireless Earphones', category: 'Accessories', color: 'White', location: 'Hostel',
    description: 'White boAt Airdopes wireless earphones in a round charging case.',
    privateDetails: 'Left earbud has a tiny crack and the case has the initials "RD" written in marker.',
    contactName: 'Rohan Das', contact: '9012345678',
  },
  {
    id: 'LF-1009', type: 'lost', daysAgo: 1, time: '15:40', status: 'CLAIM_PENDING',
    name: 'Dell Inspiron Laptop', category: 'Electronics', color: 'Grey', location: 'Computer Lab',
    description: 'Grey Dell Inspiron 15 laptop in a black sleeve.',
    privateDetails: 'There is a rocket sticker near the touchpad and the "E" key is missing.',
    contactName: 'Meera Joshi', contact: 'meera.joshi@college.edu',
  },
  {
    id: 'LF-1010', type: 'lost', daysAgo: 2, time: '12:50', status: 'LOST',
    name: 'Milton Water Bottle', category: 'Other', color: 'Blue', location: 'Cafeteria',
    description: 'Blue Milton steel water bottle, 1 litre.',
    privateDetails: 'Dent on the bottom and a "Hackathon 2025" sticker on the side.',
    contactName: 'Aditya Verma', contact: 'aditya.verma@college.edu',
  },
  {
    id: 'LF-1011', type: 'lost', daysAgo: 35, time: '15:15', status: 'LOST',
    name: 'Semester Marksheet File', category: 'Documents', color: 'Green', location: 'Administration Block',
    description: 'Green plastic file with semester marksheets and fee receipts.',
    privateDetails: 'Marksheets are in the name Kavya Hegde, USN ending with 112.',
    contactName: 'Kavya Hegde', contact: '9345678901',
  },
  {
    id: 'LF-1012', type: 'lost', daysAgo: 20, time: '12:40', status: 'RESOLVED',
    name: 'Scientific Calculator', category: 'Electronics', color: 'Grey', location: 'Laboratory',
    description: 'Casio fx-991EX scientific calculator.',
    privateDetails: 'Name sticker "NIKHIL" on the back cover.',
    contactName: 'Nikhil Rao', contact: 'nikhil.rao@college.edu',
    extra: { resolvedAt: isoDaysAgo(18) },
  },

  // ================= FOUND REPORTS =================
  {
    id: 'LF-2001', type: 'found', daysAgo: 1, time: '16:10', status: 'FOUND',
    name: 'Black iPhone', category: 'Electronics', color: 'Black', location: 'Library',
    description: 'Black iPhone found near the library entrance.',
    privateDetails: 'The back case has a few scratches near the bottom-right corner. Lock screen shows a golden retriever.',
    contactName: 'Divya Menon', contact: 'divya.menon@college.edu',
  },
  {
    id: 'LF-2002', type: 'found', daysAgo: 1, time: '12:30', status: 'CLAIM_PENDING',
    name: 'ID Card with Blue Lanyard', category: 'ID Cards', color: 'Blue', location: 'Computer Lab',
    description: 'College ID card with a blue lanyard found near system 24.',
    privateDetails: 'Roll number on the card is 22CSE045. The lanyard has an Eiffel Tower keychain.',
    contactName: 'Lab Assistant Ravi', contact: '9876501234',
  },
  {
    id: 'LF-2003', type: 'found', daysAgo: 3, time: '18:20', status: 'READY_FOR_COLLECTION',
    name: 'Silver Wrist Watch', category: 'Watches', color: 'Silver', location: 'Sports Ground',
    description: 'Silver digital watch with a metal strap found near the football goal post.',
    privateDetails: 'Engraving on the back reads "A.R.".',
    contactName: 'Coach Suresh', contact: 'sports.office@college.edu',
    extra: { claimId: 'CL-3002' },
  },
  {
    id: 'LF-2004', type: 'found', daysAgo: 2, time: '14:05', status: 'FOUND',
    name: 'Brown Wallet', category: 'Wallets', color: 'Brown', location: 'Cafeteria',
    description: 'Brown leather wallet found under a cafeteria table.',
    privateDetails: 'Has a bus pass and a small photo of a cat inside.',
    contactName: 'Canteen Staff', contact: '9234567812',
  },
  {
    id: 'LF-2005', type: 'found', daysAgo: 5, time: '10:45', status: 'COLLECTED',
    name: 'DSA Book', category: 'Books', color: 'Blue', location: 'Seminar Hall',
    description: 'Data structures book with handwritten notes left on a seminar hall chair.',
    privateDetails: 'A name is written on the first page and one chapter is highlighted.',
    contactName: 'Neha Gupta', contact: 'neha.gupta@college.edu',
    extra: { collectedAt: isoDaysAgo(3) },
  },
  {
    id: 'LF-2006', type: 'found', daysAgo: 7, time: '11:30', status: 'RESOLVED',
    name: 'Keychain with Keys', category: 'Keys', color: 'Red', location: 'Parking Area',
    description: 'Two-wheeler keys on a red keychain found near the bike stand.',
    privateDetails: 'Keychain has a bottle opener and a KA-05 tag.',
    contactName: 'Security Desk', contact: 'security@college.edu',
    extra: { collectedAt: isoDaysAgo(6), resolvedAt: isoDaysAgo(6) },
  },
  {
    id: 'LF-2007', type: 'found', daysAgo: 4, time: '09:50', status: 'CLAIM_PENDING',
    name: 'Black Backpack', category: 'Bags', color: 'Black', location: 'Seminar Hall',
    description: 'Black backpack with notebooks found after the tech fest.',
    privateDetails: 'Contains a laptop charger and a blue pencil box.',
    contactName: 'Sanjay Patil', contact: '9567890123',
  },
  {
    id: 'LF-2008', type: 'found', daysAgo: 0, time: '10:05', status: 'CLAIM_PENDING',
    name: 'Grey Laptop', category: 'Electronics', color: 'Grey', location: 'Computer Lab',
    description: 'Grey laptop in a black sleeve left on a lab desk.',
    privateDetails: 'Rocket sticker near the touchpad and one key is missing.',
    contactName: 'Lab Assistant Ravi', contact: '9876501234',
  },
  {
    id: 'LF-2009', type: 'found', daysAgo: 1, time: '17:30', status: 'FOUND',
    name: 'Steel Water Bottle', category: 'Other', color: 'Blue', location: 'Sports Ground',
    description: 'Blue steel water bottle found on the bleachers.',
    privateDetails: 'There is a hackathon sticker on the side.',
    contactName: 'Coach Suresh', contact: 'sports.office@college.edu',
  },
  {
    id: 'LF-2010', type: 'found', daysAgo: 3, time: '08:45', status: 'FOUND',
    name: 'Black Umbrella', category: 'Other', color: 'Black', location: 'Main Block',
    description: 'Black foldable umbrella found at the main entrance.',
    privateDetails: 'The handle has white tape wrapped around it.',
    contactName: 'Security Desk', contact: 'security@college.edu',
  },
  {
    id: 'LF-2011', type: 'found', daysAgo: 6, time: '14:20', status: 'FOUND',
    name: 'Spectacles in Case', category: 'Accessories', color: 'Brown', location: 'Seminar Hall',
    description: 'Pair of spectacles in a brown hard case.',
    privateDetails: 'The case has an optician label from "Vision Care, Jayanagar".',
    contactName: 'Neha Gupta', contact: 'neha.gupta@college.edu', handedTo: 'With the finder',
  },
  {
    id: 'LF-2012', type: 'found', daysAgo: 2, time: '11:15', status: 'FOUND',
    name: 'SanDisk Pen Drive', category: 'Electronics', color: 'Red', location: 'Computer Lab',
    description: '32 GB SanDisk pen drive left in a lab computer.',
    privateDetails: 'Contains a folder named "Mini Project Final".',
    contactName: 'Lab Assistant Ravi', contact: '9876501234',
  },
  {
    id: 'LF-2013', type: 'found', daysAgo: 19, time: '13:00', status: 'RESOLVED',
    name: 'Casio Calculator', category: 'Electronics', color: 'Grey', location: 'Laboratory',
    description: 'Grey Casio scientific calculator found on a lab table.',
    privateDetails: 'Name sticker on the back.',
    contactName: 'Lab Assistant Ravi', contact: '9876501234',
    extra: { resolvedAt: isoDaysAgo(18) },
  },
];

const initialItems = seedData.map(createSeedItem);

export default initialItems;
