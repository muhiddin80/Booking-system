import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class EventsQueryDto {
  @ApiProperty({ required: false, type: Number, example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, type: Number, example: 10, description: 'Items per page (max 50)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({ required: false, type: String, example: 'conference', description: 'Search by title (case-insensitive)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: ['date', 'price', 'title'], example: 'date', description: 'Sort field' })
  @IsOptional()
  @IsIn(['date', 'price', 'title'])
  sortBy?: 'date' | 'price' | 'title' = 'date';

  @ApiProperty({ required: false, enum: ['asc', 'desc'], example: 'asc', description: 'Sort order' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
