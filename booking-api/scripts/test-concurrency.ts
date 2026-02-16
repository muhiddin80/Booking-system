import axios from 'axios';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface BookingResponse {
  booking: {
    id: string;
    eventId: string;
    userId: string;
    status: string;
    createdAt: string;
  };
  event: {
    id: string;
    title: string;
    remainingTickets: number;
  };
}

interface EventResponse {
  id: string;
  title: string;
  remainingTickets: number;
  totalTickets: number;
}

const PORT = process.env.APP_PORT || '4000';
const API_URL = `http://localhost:${PORT}/api`;

class ConcurrencyTester {
  private users: LoginResponse[] = [];
  private targetEvent: EventResponse | null = null;

  async initialize() {
    console.log('🚀 Initializing concurrency test...\n');

    // Register/login multiple users
    const userCredentials = [
      { email: 'user1@test.com', password: 'Password123', name: 'User One' },
      { email: 'user2@test.com', password: 'Password123', name: 'User Two' },
      { email: 'user3@test.com', password: 'Password123', name: 'User Three' },
      { email: 'user4@test.com', password: 'Password123', name: 'User Four' },
      { email: 'user5@test.com', password: 'Password123', name: 'User Five' },
      { email: 'user6@test.com', password: 'Password123', name: 'User Six' },
      { email: 'user7@test.com', password: 'Password123', name: 'User Seven' },
      { email: 'user8@test.com', password: 'Password123', name: 'User Eight' },
      { email: 'user9@test.com', password: 'Password123', name: 'User Nine' },
      { email: 'user10@test.com', password: 'Password123', name: 'User Ten' },
    ];

    console.log('📝 Creating/logging in users...');
    for (const credentials of userCredentials) {
      try {
        // Try to register first
        const response = await axios.post<LoginResponse>(
          `${API_URL}/auth/register`,
          credentials,
        );
        this.users.push(response.data);
        console.log(`✅ Created user: ${credentials.email}`);
      } catch (error: any) {
        if (error.response?.status === 409) {
          try {
            const response = await axios.post<LoginResponse>(
              `${API_URL}/auth/login`,
              {
                email: credentials.email,
                password: credentials.password,
              },
            );
            this.users.push(response.data);
            console.log(`✅ Logged in user: ${credentials.email}`);
          } catch (loginError) {
            console.error(
              `❌ Failed to login user ${credentials.email}:`,
              loginError,
            );
          }
        } else {
          console.error(
            `❌ Failed to create user ${credentials.email}:`,
            error.response?.data,
          );
        }
      }
    }

    // Find the event with exactly 2 tickets
    console.log('\n🎯 Finding target event...');
    const eventsResponse = await axios.get<{ data: EventResponse[] }>(
      `${API_URL}/events`,
    );
    const limitedEvent = eventsResponse.data.data.find(
      (event) => event.remainingTickets === 2,
    );

    if (!limitedEvent) {
      console.error('❌ No event with exactly 2 tickets found!');
      console.log('Available events:');
      eventsResponse.data.data.forEach((event) => {
        console.log(
          `- ${event.title}: ${event.remainingTickets}/${event.totalTickets} tickets`,
        );
      });
      process.exit(1);
    }

    this.targetEvent = limitedEvent;
    console.log(
      `✅ Found target event: "${limitedEvent.title}" (${limitedEvent.remainingTickets} tickets available)\n`,
    );
  }

  async runConcurrencyTest() {
    if (!this.targetEvent || this.users.length === 0) {
      console.error('❌ Test not properly initialized');
      return;
    }

    console.log('=== Concurrency Test ===');
    console.log(
      `Event: "${this.targetEvent.title}" (${this.targetEvent.remainingTickets} tickets available)`,
    );
    console.log(
      `Sending ${this.users.length} simultaneous booking requests...\n`,
    );

    const startTime = Date.now();

    // Send all booking requests simultaneously
    const bookingPromises = this.users.map(async (user, index) => {
      try {
        const response = await axios.post<BookingResponse>(
          `${API_URL}/bookings`,
          { eventId: this.targetEvent!.id },
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
            timeout: 10000, // 10 second timeout
          },
        );
        return {
          success: true,
          user: user.user.email,
          data: response.data,
          index,
        };
      } catch (error: any) {
        return {
          success: false,
          user: user.user.email,
          error: error.response?.data?.message || error.message,
          status: error.response?.status,
          index,
        };
      }
    });

    const results = await Promise.all(bookingPromises);
    const endTime = Date.now();

    // Analyze results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const noTicketsFailed = failed.filter(
      (f) => f.status === 409 && f.error.includes('No tickets'),
    );
    const alreadyBookedFailed = failed.filter(
      (f) => f.status === 409 && f.error.includes('Already booked'),
    );

    console.log('Results:');
    console.log(`✅ Successful bookings: ${successful.length}`);
    console.log(`❌ Rejected (no tickets): ${noTicketsFailed.length}`);
    console.log(`⚠️  Rejected (already booked): ${alreadyBookedFailed.length}`);
    console.log(
      `❌ Other errors: ${failed.length - noTicketsFailed.length - alreadyBookedFailed.length}`,
    );
    failed.forEach((f) => {
      console.log(
        `DEBUG: ${f.user} failed with status [${f.status}] and message: "${f.error}"`,
      );
    });
    console.log(`⏱️  Total time: ${endTime - startTime}ms\n`);

    console.log('Verifying final event state...');
    try {
      const eventResponse = await axios.get<EventResponse>(
        `${API_URL}/events/${this.targetEvent.id}`,
      );
      const finalRemainingTickets = eventResponse.data.remainingTickets;
      console.log(`Final remaining tickets: ${finalRemainingTickets}`);

      // Determine test result
      const expectedSuccessful = 2; // We started with 2 tickets
      const expectedRemaining = 0;
      const testPassed =
        successful.length === expectedSuccessful &&
        noTicketsFailed.length === this.users.length - expectedSuccessful &&
        finalRemainingTickets === expectedRemaining;

      if (testPassed) {
        console.log('\n🎉 TEST PASSED: No overselling detected');
        console.log('✅ Exactly 2 bookings succeeded');
        console.log('✅ 8 bookings were rejected due to no tickets');
        console.log('✅ Event shows 0 remaining tickets');
      } else {
        console.log('\n❌ TEST FAILED');
        if (successful.length !== expectedSuccessful) {
          console.log(
            `❌ Expected ${expectedSuccessful} successful bookings, got ${successful.length}`,
          );
        }
        if (noTicketsFailed.length !== this.users.length - expectedSuccessful) {
          console.log(
            `❌ Expected ${this.users.length - expectedSuccessful} "no tickets" rejections, got ${noTicketsFailed.length}`,
          );
        }
        if (finalRemainingTickets !== expectedRemaining) {
          console.log(
            `❌ Expected ${expectedRemaining} remaining tickets, got ${finalRemainingTickets}`,
          );
        }
      }

      // Show details
      console.log('\n📊 Detailed Results:');
      successful.forEach((result) => {
        console.log(`✅ ${result.user}: Booking ID ${result.data?.booking.id}`);
      });
      noTicketsFailed.forEach((result) => {
        console.log(`❌ ${result.user}: ${result.error}`);
      });
      alreadyBookedFailed.forEach((result) => {
        console.log(`⚠️  ${result.user}: ${result.error}`);
      });
    } catch (error) {
      console.error('❌ Failed to verify final state:', error);
    }
  }
}

async function main() {
  const tester = new ConcurrencyTester();

  try {
    await tester.initialize();
    await tester.runConcurrencyTest();
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
main();
