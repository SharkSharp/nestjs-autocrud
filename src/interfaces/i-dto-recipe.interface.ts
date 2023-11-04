import { IRecipeMetadata } from '@Interfaces/i-recipe-metadata.interface';
import { SetMetadata, Type } from '@nestjs/common';

export const CRUD_DTO_RECIPE = 'CRUD_DTO_RECIPE';
export interface IDtoRecipeMetadata extends IRecipeMetadata {
  prop: keyof IDtoRecipe;
  target: Type<any>;
}
export const SetDtoRecipeMetadata = <Entity>(
  target: Type<Entity>,
  prop: keyof IDtoRecipe,
) =>
  SetMetadata(CRUD_DTO_RECIPE, {
    prop,
    target,
  });
export interface IDtoRecipe<
  CreateDto = any,
  UpdateDto = any,
  ReturnDto = any,
  PaginatedResultDto = any,
> {
  createDto: Type<CreateDto>;
  updateDto: Type<UpdateDto>;
  returnDto: Type<ReturnDto>;
  paginatedResultDto: Type<PaginatedResultDto>;
}
