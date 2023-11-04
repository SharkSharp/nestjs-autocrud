import { IPaginatedResult } from '@Interfaces/i-paginated-result.interface';
import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

export function paginatedResultFor<Entity>(
  target: Type<Entity>,
  className?: string,
): Type<IPaginatedResult<Entity>> {
  @ObjectType(`Paginated${target.name}Result`)
  class PaginatedResultDto implements IPaginatedResult<Entity> {
    @Field(() => [target])
    @ApiProperty({ isArray: true, type: target })
    data: Entity[];
    @ApiProperty()
    @Field(() => Int)
    count: number;
  }
  if (className) {
    Object.defineProperty(PaginatedResultDto, 'name', { value: className });
  }
  return PaginatedResultDto;
}
