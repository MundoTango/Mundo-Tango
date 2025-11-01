import { db } from '../server/db';
import { users, posts, events, eventRsvps, follows, postLikes, postComments, groups, groupMembers } from '../shared/schema';
import bcrypt from 'bcrypt';

const TANGO_CITIES = [
  { city: 'Buenos Aires', country: 'Argentina', code: 'AR' },
  { city: 'Berlin', country: 'Germany', code: 'DE' },
  { city: 'Paris', country: 'France', code: 'FR' },
  { city: 'Barcelona', country: 'Spain', code: 'ES' },
  { city: 'New York', country: 'USA', code: 'US' },
  { city: 'Toronto', country: 'Canada', code: 'CA' },
  { city: 'Milan', country: 'Italy', code: 'IT' },
  { city: 'London', country: 'UK', code: 'GB' },
];

const TANGO_NAMES = [
  'Carlos Rodriguez', 'Sofia Martinez', 'Diego Silva', 'Isabella Rossi', 'Marco Romano',
  'Elena Costa', 'Pablo Fernandez', 'Lucia Garcia', 'Federico Lopez', 'Valentina Moreno',
  'Gabriel Torres', 'Catalina Diaz', 'Sebastian Ruiz', 'Martina Castro', 'Nicolas Vargas',
  'Camila Herrera', 'Mateo Reyes', 'Luna Mendez', 'Santiago Cruz', 'Adriana Flores',
  'Julian Ramirez', 'Emilia Santos', 'Dante Ortiz', 'Bianca Rivera', 'Leonardo Chavez',
  'Victoria Gomez', 'Manuel Jimenez', 'Daniela Romero', 'Rafael Medina', 'Alejandra Navarro',
  'Andres Guerrero', 'Natalia Perez', 'Oscar Delgado', 'Carolina Morales', 'Miguel Castillo',
  'Gabriela Vega', 'Javier Ramos', 'Patricia Molina', 'Ricardo Suarez', 'Monica Campos',
  'Fernando Gil', 'Andrea Ibarra', 'Antonio Mora', 'Laura Pena', 'Jorge Rojas',
  'Silvia Soto', 'Rodrigo Nunez', 'Carmen Lara', 'Alberto Gutierrez', 'Rosa Aguilar',
  'Eduardo Ortega', 'Beatriz Mendoza', 'Francisco Rios', 'Teresa Rueda', 'Arturo Valencia',
];

const TANGO_USERNAMES = [
  'carlos_tango', 'sofia_dance', 'diego_baila', 'bella_tango', 'marco_milonga',
  'elena_abrazo', 'pablo_vals', 'lucia_giro', 'federico_sacada', 'vale_tanda',
  'gabriel_steps', 'cata_ocho', 'seba_gancho', 'martina_boleo', 'nico_parada',
  'camila_cortina', 'mateo_cadena', 'luna_enrosque', 'santi_voleo', 'adri_barrida',
  'julian_ronda', 'emilia_pivot', 'dante_colgada', 'bianca_sentada', 'leo_americana',
  'victoria_sandwich', 'manuel_volcada', 'dani_agujas', 'rafa_lapiz', 'ale_arrastre',
  'andres_llevada', 'natalia_cruzada', 'oscar_trabada', 'caro_corrida', 'miguel_salida',
  'gaby_resolución', 'javi_caminata', 'patri_cadencia', 'ricardo_compás', 'monica_marca',
  'fernando_tango', 'andrea_vals', 'antonio_milonga', 'laura_abrazo', 'jorge_giro',
  'silvia_ocho', 'rodrigo_gancho', 'carmen_boleo', 'alberto_parada', 'rosa_cortina',
  'eduardo_cadena', 'beatriz_enrosque', 'francisco_voleo', 'teresa_barrida', 'arturo_ronda',
];

const BA_VENUES = [
  'Salón Canning', 'La Viruta', 'Confitería Ideal', 'Salon La Nacional',
  'Club Gricel', 'Salon Rojo', 'Patio de Tango', 'El Beso',
];

const POST_CONTENT = [
  'Just had the most amazing tango experience tonight! The energy on the dance floor was incredible. 💃✨',
  'Looking forward to the weekend milonga. Who else is going? Let\'s share a tanda!',
  'Started practicing my ochos today. Any tips from experienced dancers?',
  'That moment when you find the perfect embrace with a new dance partner... pure magic! 🌟',
  'Excited to announce my first tango workshop next month! Will focus on musicality and connection.',
  'Beautiful evening at the milonga. Met so many wonderful dancers from around the world!',
  'Working on my giros... it\'s all about the axis and connection. Progress feels good!',
  'The tango community never ceases to amaze me. Such beautiful souls and passionate dancers! ❤️',
  'Just discovered this incredible tango orchestra. Their music is absolutely divine!',
  'Celebrating 5 years of dancing tango! This journey has transformed my life completely.',
];

const EVENT_TITLES = [
  'Weekly Milonga Night', 'Beginner Tango Workshop', 'Advanced Sacadas Masterclass',
  'Vals Workshop', 'Sunday Práctica Session', 'Tango Festival Weekend',
  'Musicality & Connection Workshop', 'Monthly Milonga Marathon', 'Tango Nouveau Evening',
  'Traditional Milonga', 'Youth Tango Night', 'Afternoon Tea Milonga',
];

const TAG_OPTIONS = ['Milonga', 'Práctica', 'Performance', 'Workshop', 'Festival', 'Travel', 'Music', 'Fashion'];

async function seed() {
  console.log('🌱 Starting comprehensive seed...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(postComments);
    await db.delete(postLikes);
    await db.delete(eventRsvps);
    await db.delete(groupMembers);
    await db.delete(posts);
    await db.delete(events);
    await db.delete(groups);
    await db.delete(follows);
    await db.delete(users);

    // Create 55 users
    console.log('👥 Creating 55 users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userRecords = [];

    for (let i = 0; i < 55; i++) {
      const cityData = TANGO_CITIES[i % TANGO_CITIES.length];
      const name = TANGO_NAMES[i] || `Dancer ${i + 1}`;
      const username = TANGO_USERNAMES[i] || `dancer_${i + 1}`;

      userRecords.push({
        name,
        username,
        email: `${username}@mundotango.com`,
        password: hashedPassword,
        city: cityData.city,
        country: cityData.country,
        countryCode: cityData.code,
        bio: `Passionate tango dancer from ${cityData.city}. Living and breathing tango every day! 💃`,
        tangoRoles: Math.random() > 0.5 ? ['leader', 'follower'] : ['leader'],
        leaderLevel: Math.floor(Math.random() * 5) + 1,
        followerLevel: Math.floor(Math.random() * 5),
        yearsOfDancing: Math.floor(Math.random() * 15) + 1,
        isOnboardingComplete: true,
        subscriptionTier: i < 10 ? 'premium' : 'free',
      });
    }

    const createdUsers = await db.insert(users).values(userRecords).returning();
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create follows (social graph)
    console.log('🤝 Creating follow relationships...');
    const followRecords = [];
    for (let i = 0; i < createdUsers.length; i++) {
      const followCount = Math.floor(Math.random() * 15) + 5;
      const followed = new Set<number>();
      
      for (let j = 0; j < followCount; j++) {
        const targetIdx = Math.floor(Math.random() * createdUsers.length);
        if (targetIdx !== i && !followed.has(targetIdx)) {
          followed.add(targetIdx);
          followRecords.push({
            followerId: createdUsers[i].id,
            followingId: createdUsers[targetIdx].id,
          });
        }
      }
    }
    await db.insert(follows).values(followRecords);
    console.log(`✅ Created ${followRecords.length} follow relationships`);

    // Create 120 posts with tags
    console.log('📝 Creating 120 posts with tags...');
    const postRecords = [];
    
    for (let i = 0; i < 120; i++) {
      const user = createdUsers[i % createdUsers.length];
      const content = POST_CONTENT[i % POST_CONTENT.length];
      const numTags = Math.floor(Math.random() * 3) + 1; // 1-3 tags per post
      const selectedTags: string[] = [];
      
      for (let t = 0; t < numTags; t++) {
        const tag = TAG_OPTIONS[Math.floor(Math.random() * TAG_OPTIONS.length)];
        if (!selectedTags.includes(tag)) {
          selectedTags.push(tag);
        }
      }

      postRecords.push({
        userId: user.id,
        content,
        tags: selectedTags,
        visibility: 'public',
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
      });
    }

    const createdPosts = await db.insert(posts).values(postRecords).returning();
    console.log(`✅ Created ${createdPosts.length} posts with tags`);

    // Create 35 events
    console.log('📅 Creating 35 events...');
    const eventRecords = [];
    const now = new Date();

    for (let i = 0; i < 35; i++) {
      const user = createdUsers[i % createdUsers.length];
      const cityData = TANGO_CITIES[i % TANGO_CITIES.length];
      const title = EVENT_TITLES[i % EVENT_TITLES.length];
      const daysAhead = Math.floor(Math.random() * 60) + 1;
      const startDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      
      const eventType = ['milonga', 'practica', 'workshop', 'festival'][Math.floor(Math.random() * 4)];
      const venue = cityData.city === 'Buenos Aires' 
        ? BA_VENUES[Math.floor(Math.random() * BA_VENUES.length)]
        : `${title} Venue`;

      eventRecords.push({
        userId: user.id,
        title: `${title} - ${cityData.city}`,
        description: `Join us for an unforgettable ${eventType} in ${cityData.city}! All levels welcome.`,
        eventType,
        startDate,
        endDate: new Date(startDate.getTime() + 4 * 60 * 60 * 1000),
        location: `${venue}, ${cityData.city}`,
        venue,
        city: cityData.city,
        country: cityData.country,
        price: Math.random() > 0.5 ? `${Math.floor(Math.random() * 30) + 10} EUR` : 'Free',
        isPaid: Math.random() > 0.5,
        tags: [eventType],
      });
    }

    const createdEvents = await db.insert(events).values(eventRecords).returning();
    console.log(`✅ Created ${createdEvents.length} events`);

    // Create event RSVPs
    console.log('🎟️ Creating event RSVPs...');
    const rsvpRecords = [];
    
    for (const event of createdEvents) {
      const attendeeCount = Math.floor(Math.random() * 100) + 20;
      const attendees = new Set<number>();
      
      for (let j = 0; j < attendeeCount; j++) {
        const userIdx = Math.floor(Math.random() * createdUsers.length);
        if (!attendees.has(userIdx)) {
          attendees.add(userIdx);
          rsvpRecords.push({
            eventId: event.id,
            userId: createdUsers[userIdx].id,
            status: 'going',
          });
        }
      }
    }

    await db.insert(eventRsvps).values(rsvpRecords);
    console.log(`✅ Created ${rsvpRecords.length} event RSVPs`);

    // Create post likes
    console.log('❤️ Creating post likes...');
    const likeRecords = [];
    
    for (const post of createdPosts) {
      const likeCount = Math.floor(Math.random() * 30) + 5;
      const likers = new Set<number>();
      
      for (let j = 0; j < likeCount; j++) {
        const userIdx = Math.floor(Math.random() * createdUsers.length);
        if (!likers.has(userIdx) && createdUsers[userIdx].id !== post.userId) {
          likers.add(userIdx);
          likeRecords.push({
            postId: post.id,
            userId: createdUsers[userIdx].id,
          });
        }
      }
    }

    await db.insert(postLikes).values(likeRecords);
    console.log(`✅ Created ${likeRecords.length} post likes`);

    // Create post comments
    console.log('💬 Creating post comments...');
    const commentRecords = [];
    const commentTexts = [
      'Beautiful! Can\'t wait to see you on the dance floor!',
      'This is exactly what I needed to hear today. Thank you!',
      'See you there! 💃',
      'Amazing progress! Keep it up!',
      'I\'ll be there for sure!',
      'This looks incredible! Count me in!',
      'Your technique is inspiring!',
      'Love this! Tango is life! ❤️',
    ];

    for (const post of createdPosts) {
      const commentCount = Math.floor(Math.random() * 8);
      
      for (let j = 0; j < commentCount; j++) {
        const userIdx = Math.floor(Math.random() * createdUsers.length);
        commentRecords.push({
          postId: post.id,
          userId: createdUsers[userIdx].id,
          content: commentTexts[j % commentTexts.length],
        });
      }
    }

    await db.insert(postComments).values(commentRecords);
    console.log(`✅ Created ${commentRecords.length} comments`);

    // Create groups
    console.log('👥 Creating tango groups...');
    const groupRecords = [
      {
        creatorId: createdUsers[0].id,
        name: 'Buenos Aires Tango Community',
        description: 'Connect with tango dancers in Buenos Aires. Share events, tips, and your love for tango!',
        groupType: 'public',
        category: 'Local Community',
        city: 'Buenos Aires',
        country: 'Argentina',
        memberCount: 234,
      },
      {
        creatorId: createdUsers[1].id,
        name: 'Beginner Tango Tips & Support',
        description: 'A welcoming space for tango beginners to ask questions, share progress, and support each other.',
        groupType: 'public',
        category: 'Learning',
        memberCount: 567,
      },
      {
        creatorId: createdUsers[2].id,
        name: 'European Tango Festival Network',
        description: 'Organize and discover tango festivals across Europe. Network with organizers and dancers.',
        groupType: 'public',
        category: 'Events',
        memberCount: 892,
      },
      {
        creatorId: createdUsers[3].id,
        name: 'Tango Musicality Masters',
        description: 'Deep dive into tango music, orchestras, and musicality. For dancers who love the music as much as the dance.',
        groupType: 'public',
        category: 'Music',
        memberCount: 445,
      },
      {
        creatorId: createdUsers[4].id,
        name: 'Berlin Tango Scene',
        description: 'All things tango in Berlin - milongas, workshops, events, and more!',
        groupType: 'public',
        category: 'Local Community',
        city: 'Berlin',
        country: 'Germany',
        memberCount: 178,
      },
    ];

    const createdGroups = await db.insert(groups).values(groupRecords).returning();
    console.log(`✅ Created ${createdGroups.length} groups`);

    // Add members to groups
    console.log('👥 Adding group members...');
    const groupMemberRecords = [];
    
    for (const group of createdGroups) {
      const memberCount = Math.floor(Math.random() * 30) + 10;
      const members = new Set<number>();
      
      for (let j = 0; j < memberCount; j++) {
        const userIdx = Math.floor(Math.random() * createdUsers.length);
        if (!members.has(userIdx)) {
          members.add(userIdx);
          groupMemberRecords.push({
            groupId: group.id,
            userId: createdUsers[userIdx].id,
            role: j === 0 ? 'admin' : 'member',
          });
        }
      }
    }

    await db.insert(groupMembers).values(groupMemberRecords);
    console.log(`✅ Added ${groupMemberRecords.length} group members`);

    console.log('\n🎉 COMPREHENSIVE SEED COMPLETE!');
    console.log('==========================================');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📝 Posts: ${createdPosts.length} (with tags)`);
    console.log(`📅 Events: ${createdEvents.length}`);
    console.log(`🎟️ RSVPs: ${rsvpRecords.length}`);
    console.log(`❤️ Likes: ${likeRecords.length}`);
    console.log(`💬 Comments: ${commentRecords.length}`);
    console.log(`🤝 Follows: ${followRecords.length}`);
    console.log(`👥 Groups: ${createdGroups.length}`);
    console.log(`📊 Group Members: ${groupMemberRecords.length}`);
    console.log('==========================================');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('✅ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
