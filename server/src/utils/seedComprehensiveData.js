/**
 * CrimeTrack — Comprehensive Moderate Dataset Seeder
 * Populates realistic, interconnected police records across all 13 subsystems.
 */
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const FIR = require('../models/FIR');
const Case = require('../models/Case');
const Crime = require('../models/Crime');
const Criminal = require('../models/Criminal');
const Investigation = require('../models/Investigation');
const AuditLog = require('../models/AuditLog');
const Feedback = require('../models/Feedback');

const seedModerateData = async () => {
  try {
    console.log('[Seeder] Starting moderate-level comprehensive database seeding...');

    // 1. Password hashes
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const officerPasswordHash = await bcrypt.hash('Officer@123', salt);
    const viewerPasswordHash = await bcrypt.hash('Viewer@123', salt);

    // 2. Clear previous dynamic operational data
    await Promise.all([
      FIR.deleteMany({}),
      Case.deleteMany({}),
      Crime.deleteMany({}),
      Criminal.deleteMany({}),
      Investigation.deleteMany({}),
      Feedback.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 3. Seed Personnel Users
    console.log('[Seeder] Creating Personnel Accounts...');
    const usersData = [
      {
        name: 'Chief Commissioner Alok Deshmukh',
        email: 'admin@crimetrack.gov',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        employeeId: 'POL-ADM-001',
        department: 'Headquarters Administration',
        phone: '+91 98200 11001',
        isActive: true,
      },
      {
        name: 'Senior Inspector Rajesh Sharma',
        email: 'officer.sharma@crimetrack.gov',
        passwordHash: officerPasswordHash,
        role: 'OFFICER',
        employeeId: 'POL-OFF-101',
        department: 'Crime Branch Unit 1',
        phone: '+91 98200 22002',
        isActive: true,
      },
      {
        name: 'Sub-Inspector Priya Patel',
        email: 'officer.patel@crimetrack.gov',
        passwordHash: officerPasswordHash,
        role: 'OFFICER',
        employeeId: 'POL-OFF-102',
        department: 'Cyber Crime Investigation Cell',
        phone: '+91 98200 33003',
        isActive: true,
      },
      {
        name: 'Inspector Amit Verma',
        email: 'officer.verma@crimetrack.gov',
        passwordHash: officerPasswordHash,
        role: 'OFFICER',
        employeeId: 'POL-OFF-103',
        department: 'Anti-Narcotics Division',
        phone: '+91 98200 44004',
        isActive: true,
      },
    ];

    const seededUsers = {};
    for (const u of usersData) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
      } else {
        existing.role = u.role;
        existing.name = u.name;
        existing.employeeId = u.employeeId;
        existing.department = u.department;
        existing.passwordHash = u.passwordHash;
        await existing.save();
      }
      seededUsers[u.email] = existing;
    }

    // Seed Viewers linked to Supervisors
    const viewersData = [
      {
        name: 'Desk Operator Sunita Rao',
        email: 'viewer.desk@crimetrack.gov',
        passwordHash: viewerPasswordHash,
        role: 'VIEWER',
        employeeId: 'POL-VIW-201',
        department: 'Station Helpdesk',
        supervisorOfficerId: seededUsers['officer.sharma@crimetrack.gov']._id,
        phone: '+91 98200 55005',
        isActive: true,
      },
      {
        name: 'Records Clerk Manoj Gupta',
        email: 'viewer.clerk@crimetrack.gov',
        passwordHash: viewerPasswordHash,
        role: 'VIEWER',
        employeeId: 'POL-VIW-202',
        department: 'Central Archive & Records',
        supervisorOfficerId: seededUsers['officer.patel@crimetrack.gov']._id,
        phone: '+91 98200 66006',
        isActive: true,
      },
    ];

    for (const v of viewersData) {
      let existing = await User.findOne({ email: v.email });
      if (!existing) {
        existing = await User.create(v);
      } else {
        existing.supervisorOfficerId = v.supervisorOfficerId;
        existing.passwordHash = v.passwordHash;
        await existing.save();
      }
      seededUsers[v.email] = existing;
    }

    const sharma = seededUsers['officer.sharma@crimetrack.gov'];
    const patel = seededUsers['officer.patel@crimetrack.gov'];
    const verma = seededUsers['officer.verma@crimetrack.gov'];
    const admin = seededUsers['admin@crimetrack.gov'];

    // 4. Seed Criminals Directory
    console.log('[Seeder] Creating Criminal Identity Records...');
    const criminalsData = [
      {
        name: 'Vikram "Blade" Malhotra',
        aliases: ['Vicky', 'Razor'],
        age: 38,
        gender: 'MALE',
        identifyingMarks: 'Linear scar across left jawline; tattoo of a scorpion on right forearm.',
        address: 'Block C, D-Nagar Chawl, Sector 4, Mumbai',
        photoUrl: '',
      },
      {
        name: 'Deepak Mohan Rao',
        aliases: ['Cyber-Deepu', 'DarkHawk'],
        age: 32,
        gender: 'MALE',
        identifyingMarks: 'Mole under right eye; burn mark on left wrist.',
        address: 'Flat 402, Green Glen Residency, Outer Ring Road, Bengaluru',
        photoUrl: '',
      },
      {
        name: 'Shabana Begum',
        aliases: ['Aapa', 'Madam Gold'],
        age: 44,
        gender: 'FEMALE',
        identifyingMarks: 'Deep stitch mark near right eyebrow.',
        address: 'House 22, Old Bazaar Lane, Hyderabad',
        photoUrl: '',
      },
      {
        name: 'Jagdish "Tiger" Yadav',
        aliases: ['Bhaiya Ji', 'Tiger'],
        age: 47,
        gender: 'MALE',
        identifyingMarks: 'Gunshot wound mark on right shoulder; missing tip of left index finger.',
        address: 'Village Khaspur, District Ghaziabad, UP',
        photoUrl: '',
      },
      {
        name: 'Anthony "Tony" D\'Souza',
        aliases: ['Tony Goa', 'Chemist'],
        age: 35,
        gender: 'MALE',
        identifyingMarks: 'Anchor tattoo on left neck; tribal sleeve on right arm.',
        address: 'House 14B, Anjuna Beach Road, North Goa',
        photoUrl: '',
      },
    ];

    const seededCriminals = [];
    for (const c of criminalsData) {
      const doc = await Criminal.create(c);
      seededCriminals.push(doc);
    }

    // 5. Seed FIRs, Cases, and Crimes in Pairs
    console.log('[Seeder] Creating FIRs, Cases, and Incident Classifications...');
    const incidentTemplates = [
      {
        firNumber: 'FIR-2026-0001',
        complainantName: 'Kishore Zaveri',
        complainantPhone: '+91 98111 22334',
        complainantAddress: '14 Opera House Arcade, Mumbai',
        incidentDate: new Date('2026-02-10T22:30:00Z'),
        incidentPlace: 'Shop 12, Zaveri Jewellers, Market St, Mumbai',
        description: 'Three armed assailants entered the jewellery showroom during closing hours, threatened security with firearms, and decamped with gold ornaments worth 45 Lakhs.',
        crimeType: 'ROBBERY',
        assignedOfficerId: sharma._id,
        // Case Link
        caseNumber: 'CASE-2026-0001',
        priority: 'CRITICAL',
        status: 'UNDER_INVESTIGATION',
        summary: 'Armed commercial robbery involving organized syndicate. Forensic ballistics and surveillance footage under analysis.',
        linkedCriminals: [seededCriminals[0]._id],
        // Crime details
        crimeCategory: 'ROBBERY',
        severityLevel: 'CRITICAL',
      },
      {
        firNumber: 'FIR-2026-0002',
        complainantName: 'Meera Nambiar (CFO, Apex Logistics)',
        complainantPhone: '+91 98222 33445',
        complainantAddress: 'Apex Towers, Tech Zone 2, Bengaluru',
        incidentDate: new Date('2026-02-18T14:15:00Z'),
        incidentPlace: 'Corporate HQ, Electronic City, Bengaluru',
        description: 'Unauthorized fund transfer of INR 1.2 Crores executed via spoofed executive email requesting urgent vendor clearance.',
        crimeType: 'CYBERCRIME',
        assignedOfficerId: patel._id,
        caseNumber: 'CASE-2026-0002',
        priority: 'HIGH',
        status: 'OPEN',
        summary: 'Phishing domain spoofing investigation. IP log tracing and mule bank account freeze notices dispatched to RBI nodal officers.',
        linkedCriminals: [seededCriminals[1]._id],
        crimeCategory: 'CYBERCRIME',
        severityLevel: 'SEVERE',
      },
      {
        firNumber: 'FIR-2026-0003',
        complainantName: 'Sunil Aggarwal',
        complainantPhone: '+91 98333 44556',
        complainantAddress: 'B-102 Grand Hyatt Enclave, Delhi',
        incidentDate: new Date('2026-02-25T21:00:00Z'),
        incidentPlace: 'Regal Banquet Hall, Airport Road, Delhi',
        description: 'Antique diamond necklace stolen from bride changing room during wedding reception festivities.',
        crimeType: 'THEFT',
        assignedOfficerId: sharma._id,
        caseNumber: 'CASE-2026-0003',
        priority: 'MEDIUM',
        status: 'SOLVED',
        summary: 'Guest and catering staff fingerprints matched with known historical offenders. Diamond necklace recovered in full.',
        linkedCriminals: [seededCriminals[2]._id],
        crimeCategory: 'THEFT',
        severityLevel: 'MODERATE',
      },
      {
        firNumber: 'FIR-2026-0004',
        complainantName: 'Ramesh Chowkidar',
        complainantPhone: '+91 98444 55667',
        complainantAddress: 'Plot 88 Industrial Area, Ghaziabad',
        incidentDate: new Date('2026-03-01T02:00:00Z'),
        incidentPlace: 'Warehouse 4, Old Mill Compound, Ghaziabad',
        description: 'Night watchman discovered deceased male victim with blunt-force trauma and gunshot wounds inside factory premises.',
        crimeType: 'HOMICIDE',
        assignedOfficerId: verma._id,
        caseNumber: 'CASE-2026-0004',
        priority: 'CRITICAL',
        status: 'CLOSED',
        summary: 'Targeted gang conflict over territorial extortion. Prime accused apprehended and convicted in Fast Track Sessions Court.',
        linkedCriminals: [seededCriminals[3]._id],
        crimeCategory: 'HOMICIDE',
        severityLevel: 'CRITICAL',
      },
      {
        firNumber: 'FIR-2026-0005',
        complainantName: 'Head Constable Dalbir Singh',
        complainantPhone: '+91 98555 66778',
        complainantAddress: 'Highway Patrol Post 14',
        incidentDate: new Date('2026-03-05T23:45:00Z'),
        incidentPlace: 'National Highway 48 Checkpoint, Sector 8',
        description: 'Vehicle interception led to seizure of 2.5 kg commercial contraband hidden inside modified spare tyre compartment.',
        crimeType: 'EXTORTION',
        assignedOfficerId: verma._id,
        caseNumber: 'CASE-2026-0005',
        priority: 'HIGH',
        status: 'UNDER_INVESTIGATION',
        summary: 'Interstate drug trafficking racket. Interrogations ongoing to identify chemical manufacturing lab and distributor hubs.',
        linkedCriminals: [seededCriminals[4]._id],
        crimeCategory: 'EXTORTION',
        severityLevel: 'SEVERE',
      },
      {
        firNumber: 'FIR-2026-0006',
        complainantName: 'Dr. Vivek Sengupta',
        complainantPhone: '+91 98666 77889',
        complainantAddress: 'Flat 12A, Palm Heights, Sector 62',
        incidentDate: new Date('2026-03-10T19:00:00Z'),
        incidentPlace: 'Palm Heights Tower 3, Sector 62, Noida',
        description: 'Apartment lock broken during family vacation. Electronics, cash, and luxury watches valued at 8.5 Lakhs missing.',
        crimeType: 'BURGLARY',
        assignedOfficerId: sharma._id,
        caseNumber: 'CASE-2026-0006',
        priority: 'MEDIUM',
        status: 'UNDER_INVESTIGATION',
        summary: 'CCTV footage analysis of service lift and entry boom barrier. Latent fingerprint lifting conducted by forensic team.',
        linkedCriminals: [seededCriminals[0]._id],
        crimeCategory: 'BURGLARY',
        severityLevel: 'MODERATE',
      },
    ];

    const seededCases = [];
    for (const t of incidentTemplates) {
      // 1. Create FIR
      const firDoc = await FIR.create({
        firNumber: t.firNumber,
        complainantName: t.complainantName,
        complainantPhone: t.complainantPhone,
        complainantAddress: t.complainantAddress,
        incidentDate: t.incidentDate,
        incidentPlace: t.incidentPlace,
        description: t.description,
        crimeType: t.crimeType,
        assignedOfficerId: t.assignedOfficerId,
      });

      // 2. Create Case
      const caseDoc = await Case.create({
        caseNumber: t.caseNumber,
        firId: firDoc._id,
        assignedOfficerId: t.assignedOfficerId,
        priority: t.priority,
        status: t.status,
        summary: t.summary,
        closedAt: t.status === 'CLOSED' || t.status === 'SOLVED' ? new Date() : null,
      });
      seededCases.push(caseDoc);

      // Link Case back into Criminal records
      for (const crimId of t.linkedCriminals || []) {
        await Criminal.findByIdAndUpdate(crimId, { $addToSet: { associatedCaseIds: caseDoc._id } });
      }

      // 3. Create Crime Record
      await Crime.create({
        caseId: caseDoc._id,
        crimeType: t.crimeCategory,
        severity: t.severityLevel,
        location: t.incidentPlace,
        crimeDate: t.incidentDate,
        description: t.description,
      });
    }

    // 6. Seed Investigation Timeline Journal & Evidence Attachments
    console.log('[Seeder] Creating Investigation Journals and Evidence Attachments...');
    const investigationsData = [
      {
        caseId: seededCases[0]._id, // Zaveri Robbery
        officerId: sharma._id,
        title: 'Initial Crime Scene Assessment & Security Tapes Seizure',
        stage: 'INITIAL_EVALUATION',
        notes: 'Inspected showroom entry and exit points. High-definition DVR recorder seized. Recovered two empty 9mm cartridge casings near billing counter.',
        evidence: [
          {
            name: '9mm Spent Cartridge Casings (2 Qty)',
            type: 'WEAPON',
            description: 'Brass spent bullet shell casings recovered from floor near cash counter.',
            collectedAt: new Date('2026-02-11T11:00:00Z'),
          },
          {
            name: 'CCTV Showroom Entry Footage (DVR-1)',
            type: 'DIGITAL',
            description: '4K video footage capturing face profiles of 3 masked suspects carrying duffle bags.',
            collectedAt: new Date('2026-02-11T12:30:00Z'),
          },
        ],
      },
      {
        caseId: seededCases[0]._id, // Zaveri Robbery
        officerId: sharma._id,
        title: 'Ballistics Examination & Vehicle Tracker Interception',
        stage: 'EVIDENCE_COLLECTION',
        notes: 'Ballistic report confirms cartridges fired from country-made automatic pistol. Getaway motorcycle identified via toll plaza ANPR camera matching suspect Vikram Malhotra syndicate.',
        evidence: [
          {
            name: 'CFSL Ballistics Examination Report #CFSL-2026-88',
            type: 'DOCUMENT',
            description: 'Official 14-page ballistic analysis report matching firing pin indentations.',
            collectedAt: new Date('2026-02-15T15:00:00Z'),
          },
        ],
      },
      {
        caseId: seededCases[1]._id, // Cyber Wire Fraud
        officerId: patel._id,
        title: 'Email Header Forensics & Server Log Extraction',
        stage: 'INITIAL_EVALUATION',
        notes: 'Extracted raw RFC-822 email headers from corporate mail server. Sender address spoofed from external overseas proxy server. Identified beneficiary bank accounts in Bangalore and Mumbai.',
        evidence: [
          {
            name: 'Raw Email Headers & DKIM/SPF Audit Log',
            type: 'DIGITAL',
            description: 'Cryptographic email trace showing spoofed DNS MX record routing.',
            collectedAt: new Date('2026-02-19T10:00:00Z'),
          },
        ],
      },
      {
        caseId: seededCases[2]._id, // Diamond Necklace Solved
        officerId: sharma._id,
        title: 'Locker Search & Full Property Recovery',
        stage: 'FINAL_REPORT',
        notes: 'Interrogation of banquet temporary staff led to recovery of intact diamond necklace from a private safe deposit locker. Charge sheet submitted to Metropolitan Magistrate.',
        evidence: [
          {
            name: 'Recovered 18k White Gold Diamond Necklace',
            type: 'PHYSICAL',
            description: 'Antique jewellery piece with 120 certified brilliant-cut diamonds verified by appraiser.',
            collectedAt: new Date('2026-02-28T16:00:00Z'),
          },
        ],
      },
    ];

    for (const inv of investigationsData) {
      await Investigation.create(inv);
    }

    // 7. Seed Feedback & Satisfaction Ratings
    console.log('[Seeder] Creating Citizen & Officer Feedback Submissions...');
    const feedbacksData = [
      {
        userId: sharma._id,
        feedbackType: 'FEATURE_REQUEST',
        category: 'Investigation Tools',
        subject: 'Batch Forensics Document Uploader',
        message: 'Requesting support for drag-and-drop batch upload of multi-page ballistics and lab forensics PDFs directly into investigation logs.',
        rating: 5,
        status: 'RESOLVED',
        priority: 'HIGH',
        adminResponse: 'Feature approved and implemented in Milestone 10/11 release suite.',
        resolvedBy: admin._id,
        resolvedAt: new Date('2026-02-20T11:00:00Z'),
      },
      {
        userId: patel._id,
        feedbackType: 'SYSTEM_FEEDBACK',
        category: 'Performance & Speed',
        subject: 'Exceptional response speed on Global Search engine',
        message: 'The new multi-filter cross-entity search handles omni-queries across cases and criminals within 30ms. Very helpful for rapid field lookups.',
        rating: 5,
        status: 'RESOLVED',
        priority: 'LOW',
        adminResponse: 'Thank you Sub-Inspector Patel. The indexing enhancements in M9 are operating as expected.',
        resolvedBy: admin._id,
        resolvedAt: new Date('2026-02-22T14:00:00Z'),
      },
      {
        userId: verma._id,
        feedbackType: 'BUG_REPORT',
        category: 'Evidence Handling',
        subject: 'Weapon serial number formatting in mobile viewport',
        message: 'Long weapon serial numbers wrapped unexpectedly on 320px screens. Requesting overflow ellipsis style.',
        rating: 4,
        status: 'IN_REVIEW',
        priority: 'MEDIUM',
        adminResponse: 'Design tokens updated with responsive typography in M15 polish.',
      },
      {
        userId: sharma._id,
        feedbackType: 'CASE_FEEDBACK',
        category: 'General',
        subject: 'Fast-track clearance of Zaveri Jewellers Case',
        message: 'Complainant family expressed gratitude for rapid recovery of ancestral jewellery and professional handling by the precinct team.',
        rating: 5,
        status: 'RESOLVED',
        priority: 'HIGH',
        relatedCaseId: seededCases[2]._id,
        adminResponse: 'Commendation certificate logged on Officer Sharma personnel dossier.',
        resolvedBy: admin._id,
        resolvedAt: new Date('2026-03-02T10:00:00Z'),
      },
    ];

    for (const fb of feedbacksData) {
      await Feedback.create(fb);
    }

    // 8. Seed Audit Trail Logs with Rich Diff Snapshots (For Audit & Undo Verification)
    console.log('[Seeder] Creating Forensic Audit Logs & Diff Snapshots...');
    const auditLogsData = [
      {
        userId: admin._id,
        role: 'ADMIN',
        action: 'CREATE_USER',
        entityType: 'User',
        entityId: sharma._id,
        newValues: { name: sharma.name, email: sharma.email, role: 'OFFICER' },
        metadata: { clientIp: '127.0.0.1', userAgent: 'CrimeTrack Command Terminal' },
        createdAt: new Date('2026-02-01T08:30:00Z'),
      },
      {
        userId: sharma._id,
        role: 'OFFICER',
        action: 'REGISTER_FIR',
        entityType: 'FIR',
        entityId: seededCases[0].firId,
        newValues: { firNumber: 'FIR-2026-0001', crimeType: 'ROBBERY' },
        metadata: { clientIp: '127.0.0.1' },
        createdAt: new Date('2026-02-11T09:00:00Z'),
      },
      {
        userId: sharma._id,
        role: 'OFFICER',
        action: 'CREATE_CASE',
        entityType: 'Case',
        entityId: seededCases[0]._id,
        newValues: { caseNumber: 'CASE-2026-0001', priority: 'CRITICAL', status: 'OPEN' },
        metadata: { clientIp: '127.0.0.1' },
        createdAt: new Date('2026-02-11T09:15:00Z'),
      },
      {
        userId: sharma._id,
        role: 'OFFICER',
        action: 'UPDATE_CASE_STATUS',
        entityType: 'Case',
        entityId: seededCases[0]._id,
        oldValues: { status: 'OPEN', priority: 'CRITICAL' },
        newValues: { status: 'UNDER_INVESTIGATION', priority: 'CRITICAL' },
        metadata: { notes: 'Surveillance evidence collected; status promoted.' },
        createdAt: new Date('2026-02-12T10:00:00Z'),
      },
      {
        userId: sharma._id,
        role: 'OFFICER',
        action: 'ADD_EVIDENCE',
        entityType: 'Investigation',
        entityId: seededCases[0]._id,
        newValues: { title: '9mm Spent Cartridge Casings (2 Qty)', evidenceType: 'WEAPON' },
        metadata: { location: 'Vault 2B' },
        createdAt: new Date('2026-02-12T11:00:00Z'),
      },
      {
        userId: sharma._id,
        role: 'OFFICER',
        action: 'LINK_CRIMINAL_CASE',
        entityType: 'Criminal',
        entityId: seededCriminals[0]._id,
        newValues: { linkedCaseId: seededCases[0]._id.toString(), criminalName: seededCriminals[0].name },
        metadata: { reason: 'ANPR toll footage match' },
        createdAt: new Date('2026-02-15T16:00:00Z'),
      },
      {
        userId: verma._id,
        role: 'OFFICER',
        action: 'UPDATE_CASE_STATUS',
        entityType: 'Case',
        entityId: seededCases[3]._id,
        oldValues: { status: 'UNDER_INVESTIGATION' },
        newValues: { status: 'CLOSED' },
        metadata: { reason: 'Accused convicted in fast track court.' },
        createdAt: new Date('2026-03-02T18:00:00Z'),
      },
      {
        userId: admin._id,
        role: 'ADMIN',
        action: 'TRIAGE_FEEDBACK',
        entityType: 'Feedback',
        entityId: feedbacksData[0]._id,
        oldValues: { status: 'PENDING', priority: 'MEDIUM' },
        newValues: { status: 'RESOLVED', priority: 'HIGH' },
        metadata: { triagedBy: 'Chief Commissioner Alok Deshmukh' },
        createdAt: new Date('2026-03-02T19:00:00Z'),
      },
    ];

    for (const al of auditLogsData) {
      await AuditLog.create(al);
    }

    console.log('[Seeder] Comprehensive moderate dataset seeded successfully!');
    return {
      usersCount: Object.keys(seededUsers).length,
      criminalsCount: seededCriminals.length,
      firsCount: incidentTemplates.length,
      casesCount: seededCases.length,
      investigationsCount: investigationsData.length,
      feedbacksCount: feedbacksData.length,
      auditLogsCount: auditLogsData.length,
    };
  } catch (error) {
    console.error('[Seeder] Seeding error:', error);
    throw error;
  }
};

module.exports = { seedModerateData };

if (require.main === module) {
  const { connectDatabase } = require('../config/database');
  connectDatabase()
    .then(async () => {
      const summary = await seedModerateData();
      console.log('Seeding Summary:', summary);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
