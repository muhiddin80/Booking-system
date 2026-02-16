import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateBookingDto } from './dtos';
import { BookingStatus, Prisma } from '@prisma/client';
import type { EventQueryResult } from 'src/types';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { eventId } = createBookingDto;

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const event = await tx.$queryRaw<EventQueryResult[]>`
            SELECT id, "remainingTickets" FROM "Event" WHERE id = ${eventId} FOR UPDATE
          `;

          if (!event || event.length === 0) {
            throw new NotFoundException('Event not found');
          }

          const eventData = event[0];

          if (eventData.remainingTickets <= 0) {
            throw new ConflictException('No tickets available');
          }

          const existingBooking = await tx.booking.findFirst({
            where: {
              userId,
              eventId,
              status: BookingStatus.CONFIRMED,
            },
          });

          if (existingBooking) {
            throw new ConflictException('Already booked');
          }

          const [booking] = await Promise.all([
            tx.booking.create({
              data: {
                userId,
                eventId,
                status: BookingStatus.CONFIRMED,
              },
              include: {
                event: {
                  select: { id: true, title: true, remainingTickets: true },
                },
              },
            }),
            tx.event.update({
              where: { id: eventId },
              data: {
                remainingTickets: { decrement: 1 },
              },
            }),
          ]);

          return {
            booking,
            event: booking.event,
          };
        },
        {
          isolationLevel: 'ReadCommitted',
          timeout: 10000,
        },
      );
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2034' || error.meta?.code === '40001') {
          throw new ConflictException('No tickets available');
        }
      }

      console.error('Actual DB Error:', error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            venue: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings;
  }

  async cancel(userId: string, bookingId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Find the booking
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { event: true },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check if the booking belongs to the user
      if (booking.userId !== userId) {
        throw new ForbiddenException('You can only cancel your own bookings');
      }

      // Check if booking is already cancelled
      if (booking.status === BookingStatus.CANCELLED) {
        throw new ConflictException('Booking is already cancelled');
      }

      // Update booking status and increment remaining tickets
      const [updatedBooking] = await Promise.all([
        tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED },
        }),
        tx.event.update({
          where: { id: booking.eventId },
          data: {
            remainingTickets: {
              increment: 1,
            },
          },
        }),
      ]);

      return {
        id: updatedBooking.id,
        eventId: updatedBooking.eventId,
        userId: updatedBooking.userId,
        status: updatedBooking.status,
        createdAt: updatedBooking.createdAt,
      };
    });
  }
}
