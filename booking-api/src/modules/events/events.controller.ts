import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import {
  EventResponseDto,
  EventsListResponseDto,
  EventsQueryDto,
} from './dtos';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all events with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: EventsListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'conference',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['date', 'price', 'title'],
    example: 'date',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  async findAll(
    @Query() query: EventsQueryDto,
  ): Promise<EventsListResponseDto> {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.findOne(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }
}
