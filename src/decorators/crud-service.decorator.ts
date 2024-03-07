import { SetEntityRecipeMetadata } from '@Interfaces/i-entity-recipe.interface';
import { Type, applyDecorators } from '@nestjs/common';

export interface ICrudServiceOptions {
  noRepository?: boolean;
}

export const CrudService = <Entity>(
  target: Type<Entity>,
  options?: ICrudServiceOptions,
) => applyDecorators(SetEntityRecipeMetadata(target, 'service', options));
