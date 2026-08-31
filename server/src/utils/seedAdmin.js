const User = require('../models/User');

/**
 * Seed initial administrative and demo accounts if none exist
 */
const seedInitialUsers = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'ADMIN', isDeleted: false });

    if (adminCount === 0) {
      console.log('[Seeder] No administrator found. Seeding initial accounts...');

      // 1. Create System Admin
      const adminPasswordHash = await User.hashPassword('Admin@123');
      const admin = await User.create({
        name: 'Chief Admin',
        email: 'admin@crimetrack.gov',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        phone: '9876543210',
        employeeId: 'ADM-001',
        isActive: true,
      });
      console.log(`[Seeder] Admin created: ${admin.email} (Password: Admin@123)`);

      // 2. Create Demo Officer
      const officerPasswordHash = await User.hashPassword('Officer@123');
      const officer = await User.create({
        name: 'Inspector Rajesh Sharma',
        email: 'officer.sharma@crimetrack.gov',
        passwordHash: officerPasswordHash,
        role: 'OFFICER',
        phone: '9876543211',
        employeeId: 'OFF-101',
        isActive: true,
      });
      console.log(`[Seeder] Officer created: ${officer.email} (Password: Officer@123)`);

      // 3. Create Demo Viewer (Supervised by Officer Sharma)
      const viewerPasswordHash = await User.hashPassword('Viewer@123');
      const viewer = await User.create({
        name: 'Sub-Inspector Amit Patel',
        email: 'viewer.patel@crimetrack.gov',
        passwordHash: viewerPasswordHash,
        role: 'VIEWER',
        phone: '9876543212',
        employeeId: 'VIW-201',
        supervisorOfficerId: officer._id,
        isActive: true,
      });
      console.log(`[Seeder] Viewer created: ${viewer.email} (Password: Viewer@123, Supervisor: ${officer.name})`);
      console.log('[Seeder] Initial seed complete.');
    }
  } catch (error) {
    console.error('[Seeder] Error seeding accounts:', error.message);
  }
};

module.exports = {
  seedInitialUsers,
};
