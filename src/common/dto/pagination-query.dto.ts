import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  // @Type(() => Number) // parsed value to the number because query params are sent as strings
  @IsOptional()
  @IsPositive()
  limit: number;

  // @Type(() => Number) // removed due to settings in global ValidationPipe
  @IsOptional()
  @IsPositive()
  offset: number;
}
