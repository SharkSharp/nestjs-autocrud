import { ICrudRepository } from '@/crud.repository';
import { ICrudService } from '@/crud.service';
import { IRecipeMetadata } from '@Interfaces/i-recipe-metadata.interface';
import { AutomapperProfile } from '@automapper/nestjs';
import { SetMetadata, Type } from '@nestjs/common';

export const CRUD_ENTITY_RECIPE = 'CRUD_ENTITY_RECIPE';
export interface IEntityRecipeMetadata<Entity> extends IRecipeMetadata<Entity> {
  prop: keyof IEntityRecipe<Entity>;
}
export const SetEntityRecipeMetadata = <Entity>(
  target: Type<Entity>,
  prop: keyof IEntityRecipe<Entity>,
) =>
  SetMetadata(CRUD_ENTITY_RECIPE, {
    prop,
    target,
  });
export interface IEntityRecipe<Entity> {
  repository?: Type<ICrudRepository<Entity>>;
  service?: Type<ICrudService<Entity>>;
  controller?: Type<any>;
  mapperProfile?: Type<AutomapperProfile>;
}
