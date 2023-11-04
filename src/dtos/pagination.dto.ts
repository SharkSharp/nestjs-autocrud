import { IPagination } from '@Interfaces/i-pagination.interface';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ArgsType()
export class PaginationDto implements IPagination {
  @ApiProperty()
  @Field(() => Int)
  take: number;
  @ApiProperty()
  @Field(() => Int)
  skip: number;
}
