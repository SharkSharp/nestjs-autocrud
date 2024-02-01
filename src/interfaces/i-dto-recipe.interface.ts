import { DeepPartial } from '@Helpers/mapped-types';
import { IPaginatedResult } from '@Interfaces/i-paginated-result.interface';
import { IRecipeMetadata } from '@Interfaces/i-recipe-metadata.interface';
import { SetMetadata, Type } from '@nestjs/common';

export const CRUD_DTO_RECIPE = 'CRUD_DTO_RECIPE';
export interface IDtoRecipeMetadata<
  Entity,
  K extends string | number | symbol = 'id',
  CreateDto = Omit<Entity, K>,
  UpdateDto extends DeepPartial<Entity> = DeepPartial<Entity>,
  ReturnDto = Entity,
  PaginatedResultDto = IPaginatedResult<ReturnDto>,
> extends IRecipeMetadata<Entity> {
  prop: keyof IDtoRecipe<
    Entity,
    K,
    CreateDto,
    UpdateDto,
    ReturnDto,
    PaginatedResultDto
  >;
}
export const SetDtoRecipeMetadata = <Entity>(
  target: Type<Entity>,
  prop: keyof IDtoRecipe<Entity>,
) =>
  SetMetadata(CRUD_DTO_RECIPE, {
    prop,
    target,
  });
export interface IDtoRecipe<
  Entity,
  K extends string | number | symbol = 'id',
  CreateDto = Omit<Entity, K>,
  UpdateDto extends DeepPartial<Entity> = DeepPartial<Entity>,
  ReturnDto = Entity,
  PaginatedResultDto = IPaginatedResult<ReturnDto>,
> {
  createDto: Type<CreateDto>;
  updateDto: Type<UpdateDto>;
  returnDto: Type<ReturnDto>;
  paginatedResultDto: Type<PaginatedResultDto>;
}
