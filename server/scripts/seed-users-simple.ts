import { db } from '@shared/db';
import { users } from '@shared/schema';
import bcrypt from 'bcrypt';

async function seedUsers() {
  console.log('🌍 Creating test users for Mundo Tango...\n');

  const testUsers = [
    {
      email: 'admin@mundotango.life',
      username: 'admin',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      bio: 'Platform administrator',
      city: 'Buenos Aires',
      country: 'Argentina',
      tangoRoles: ['Organizer', 'Teacher'],
    },
    {
      email: 'maria@tango.com',
      username: 'maria_teacher',
      name: 'María González',
      firstName: 'María',
      lastName: 'González',
      bio: 'Professional tango teacher from Buenos Aires. 20+ years experience.',
      city: 'Buenos Aires',
      country: 'Argentina',
      tangoRoles: ['Teacher', 'Performer'],
    },
    {
      email: 'carlos@tango.com',
      username: 'carlos_dj',
      name: 'Carlos Rodriguez',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      bio: 'Tango DJ specializing in golden age orchestras.',
      city: 'Madrid',
      country: 'Spain',
      tangoRoles: ['DJ', 'Dancer'],
    },
    {
      email: 'sofia@tango.com',
      username: 'sofia_organizer',
      name: 'Sofia Martinez',
      firstName: 'Sofia',
      lastName: 'Martinez',
      bio: 'Event organizer and milonga host.',
      city: 'New York',
      country: 'United States',
      tangoRoles: ['Organizer', 'Dancer'],
    },
    {
      email: 'pablo@tango.com',
      username: 'pablo_dancer',
      name: 'Pablo Lopez',
      firstName: 'Pablo',
      lastName: 'Lopez',
      bio: 'Passionate tango dancer and teacher.',
      city: 'Berlin',
      country: 'Germany',
      tangoRoles: ['Dancer', 'Teacher'],
    },
  ];

  const password = await bcrypt.hash('MundoTango2025!', 10);
  let created = 0;

  for (const user of testUsers) {
    try {
      await db.insert(users).values({
        email: user.email,
        username: user.username,
        name: user.name,
        password: password,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        city: user.city,
        country: user.country,
        tangoRoles: user.tangoRoles,
        role: user.email.includes('admin') ? 'admin' : 'user',
        isActive: true,
        isVerified: true,
      }).onConflictDoNothing();
      
      created++;
      console.log(`  ✅ Created: ${user.firstName} ${user.lastName} (${user.email})`);
    } catch (error: any) {
      if (error?.code === '23505') {
        console.log(`  ⏭️  Skipped (exists): ${user.email}`);
      } else {
        console.error(`  ❌ Failed: ${user.email}`, error?.message);
      }
    }
  }

  console.log(`\n✨ User seeding complete! Created ${created} users.`);
  
  // Get user IDs for events seed script
  const allUsers = await db.select({ id: users.id, email: users.email }).from(users).limit(10);
  console.log('\nUser IDs for reference:');
  allUsers.forEach(u => console.log(`  - ${u.id}: ${u.email}`));
}

seedUsers()
  .then(() => {
    console.log('\n✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  });
