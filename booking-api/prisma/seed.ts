import { PrismaClient, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: await bcrypt.hash('Password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        password: await bcrypt.hash('Password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.wilson@example.com',
        name: 'Mike Wilson',
        password: await bcrypt.hash('Password123', 10),
      },
    }),
  ]);

  console.log('Created 3 users');

  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Tech Conference 2025',
        description:
          'Annual technology conference featuring the latest innovations in AI, blockchain, and cloud computing.',
        date: new Date('2025-03-15T10:00:00Z'),
        venue: 'Convention Center',
        totalTickets: 100,
        remainingTickets: 100,
        price: 49.99,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Limited Concert',
        description:
          'Exclusive concert with limited seating. First come, first served.',
        date: new Date('2025-04-20T19:00:00Z'),
        venue: 'Grand Theater',
        totalTickets: 2,
        remainingTickets: 2,
        price: 89.99,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Business Summit',
        description:
          'Network with industry leaders and learn about the latest business trends.',
        date: new Date('2025-05-10T09:00:00Z'),
        venue: 'Business Center',
        totalTickets: 50,
        remainingTickets: 25,
        price: 129.99,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Art Exhibition',
        description:
          'Contemporary art exhibition featuring local and international artists.',
        date: new Date('2025-06-01T14:00:00Z'),
        venue: 'Art Gallery',
        totalTickets: 100,
        remainingTickets: 30,
        price: 25.0,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Food Festival',
        description:
          'Taste cuisines from around the world at this annual food festival.',
        date: new Date('2025-07-15T12:00:00Z'),
        venue: 'City Park',
        totalTickets: 200,
        remainingTickets: 20,
        price: 15.5,
      },
    }),
  ]);

  console.log('Created 5 events');

  await Promise.all([
    prisma.booking.create({
      data: {
        userId: users[0].id,
        eventId: events[0].id,
        status: BookingStatus.CONFIRMED,
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[1].id,
        eventId: events[0].id,
        status: BookingStatus.CONFIRMED,
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[2].id,
        eventId: events[2].id,
        status: BookingStatus.CONFIRMED,
      },
    }),
  ]);

  await Promise.all([
    prisma.event.update({
      where: { id: events[0].id },
      data: { remainingTickets: 98 },
    }),
    prisma.event.update({
      where: { id: events[2].id },
      data: { remainingTickets: 49 },
    }),
  ]);

  console.log('Created sample bookings');

  console.log('Database seeding completed!');
  console.log('\n Summary:');
  console.log(`- Users: ${users.length}`);
  console.log(`- Events: ${events.length}`);
  console.log(`- Bookings: 3`);
  console.log('\n Test Event for Concurrency:');
  console.log(`- "Limited Concert" has exactly 2 tickets remaining`);
  console.log(`- Perfect for testing race conditions!`);
}

main()
  .catch((e) => {
    console.error(' Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
