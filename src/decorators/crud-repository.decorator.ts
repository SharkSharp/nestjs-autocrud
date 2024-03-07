import { SetEntityRecipeMetadata } from '@Interfaces/i-entity-recipe.interface';
import { Type, applyDecorators } from '@nestjs/common';

export interface ICrudRepositoryOptions {
  noOrm?: boolean;
}

export const CrudRepository = <Entity>(
  target: Type<Entity>,
  options?: ICrudRepositoryOptions,
) => applyDecorators(SetEntityRecipeMetadata(target, 'repository', options));
