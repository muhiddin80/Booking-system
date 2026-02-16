import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: 'uuid',
    description: 'Event ID to book a ticket for',
  })
  @IsString()
  @IsUUID()
  eventId: string;
}
