import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import {
  EventsQueryDto,
  EventsListResponseDto,
  EventResponseDto,
} from './dtos';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: EventsQueryDto): Promise<EventsListResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'date',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 50);

    const where = search
      ? {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const orderBy = {
      [sortBy]: sortOrder,
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      data: events.map((event) => ({
        ...event,
        date: event.date.toISOString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit: take,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      venue: event.venue,
      totalTickets: event.totalTickets,
      remainingTickets: event.remainingTickets,
      price: event.price,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }
}
