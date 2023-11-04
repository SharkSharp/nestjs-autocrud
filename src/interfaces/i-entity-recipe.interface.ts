import { IRecipeMetadata } from '@Interfaces/i-recipe-metadata.interface';
import { AutomapperProfile } from '@automapper/nestjs';
import { SetMetadata, Type } from '@nestjs/common';

export const CRUD_ENTITY_RECIPE = 'CRUD_ENTITY_RECIPE';
export interface IEntityRecipeMetadata extends IRecipeMetadata {
  prop: keyof IEntityRecipe;
  target: Type<any>;
}
export const SetEntityRecipeMetadata = <Entity>(
  target: Type<Entity>,
  prop: keyof IEntityRecipe,
) =>
  SetMetadata(CRUD_ENTITY_RECIPE, {
    prop,
    target,
  });
export interface IEntityRecipe {
  repository?: Type<any>;
  service?: Type<any>;
  controller?: Type<any>;
  mapperProfile?: Type<AutomapperProfile>;
}
