import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({ type: 'string', example: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', example: 'Tech Conference 2025' })
  title: string;

  @ApiProperty({ type: 'string', example: 'Annual technology conference...' })
  description: string;

  @ApiProperty({ type: 'string', example: '2025-03-15T10:00:00Z' })
  date: string;

  @ApiProperty({ type: 'string', example: 'Convention Center' })
  venue: string;

  @ApiProperty({ type: 'number', example: 100 })
  totalTickets: number;

  @ApiProperty({ type: 'number', example: 42 })
  remainingTickets: number;

  @ApiProperty({ type: 'number', example: 49.99 })
  price: number;

  @ApiProperty({ type: 'string', example: '2025-01-15T12:00:00Z' })
  createdAt: string;

  @ApiProperty({ type: 'string', example: '2025-01-15T12:00:00Z' })
  updatedAt: string;
}

export class EventsListResponseDto {
  @ApiProperty({ type: [EventResponseDto] })
  data: EventResponseDto[];

  @ApiProperty({
    type: 'object',
    example: { total: 25, page: 1, limit: 10, totalPages: 3 },
    additionalProperties: true,
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
