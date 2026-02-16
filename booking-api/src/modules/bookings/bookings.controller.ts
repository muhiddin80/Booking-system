import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dtos';
import { AtGuard } from '../auth/guards';

@ApiTags('bookings')
@UseGuards(AtGuard)
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 409, description: 'No tickets available or already booked' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async create(@Request() req: any, @Body() createBookingDto: CreateBookingDto): Promise<any> {
    const userId = req.user.sub;
    return this.bookingsService.create(userId, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings for authenticated user' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async findAll(@Request() req: any): Promise<any[]> {
    const userId = req.user.sub;
    return this.bookingsService.findAll(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async cancel(@Request() req: any, @Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const userId = req.user.sub;
    return this.bookingsService.cancel(userId, id);
  }
}
