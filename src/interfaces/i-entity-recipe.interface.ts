import { ICrudRepository } from '@/crud.repository';
import { ICrudService } from '@/crud.service';
import { ICrudControllerOptions } from '@Decorators/crud-controller.decorator';
import { ICrudRepositoryOptions } from '@Decorators/crud-repository.decorator';
import { ICrudServiceOptions } from '@Decorators/crud-service.decorator';
import { IRecipeMetadata } from '@Interfaces/i-recipe-metadata.interface';
import { AutomapperProfile } from '@automapper/nestjs';
import { SetMetadata, Type } from '@nestjs/common';

export const CRUD_ENTITY_RECIPE = 'CRUD_ENTITY_RECIPE';
export interface IEntityRecipeMetadata<Entity> extends IRecipeMetadata<Entity> {
  prop: keyof IEntityRecipe<Entity>;
  options?: IEntityRecipeOptions;
}
export interface IEntityRecipeOptions
  extends ICrudRepositoryOptions,
    ICrudServiceOptions,
    ICrudControllerOptions {}
export const SetEntityRecipeMetadata = <Entity>(
  target: Type<Entity>,
  prop: keyof IEntityRecipe<Entity>,
  options?: IEntityRecipeOptions,
) =>
  SetMetadata(CRUD_ENTITY_RECIPE, {
    prop,
    target,
    options,
  });
export interface IEntityRecipe<Entity> {
  repository?: Type<ICrudRepository<Entity>>;
  service?: Type<ICrudService<Entity>>;
  controller?: Type<any>;
  mapperProfile?: Type<AutomapperProfile>;
  options?: IEntityRecipeOptions;
}
