import { paginatedResultFor } from '@Dtos/paginatedResult.dto';
import { OmitType } from '@Helpers/mapped-types/omit-type.helper';
import { PartialType } from '@Helpers/mapped-types/partial-type.helper';
import { Type } from '@nestjs/common';

export const createDtoFor = (entity: Type<any>): Type<any> =>
  OmitType(entity, ['id'] as const, `Create${entity.name}Dto`);

export const updateDtoFor = (entity: Type<any>): Type<any> =>
  PartialType(createDtoFor(entity), `Update${entity.name}Dto`);

export const paginatedResultDtoFor = (entity: Type<any>): Type<any> =>
  paginatedResultFor(entity, `Paginated${entity.name}ResultDto`);
