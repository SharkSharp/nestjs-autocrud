import { SetEntityRecipeMetadata } from '@Interfaces/i-entity-recipe.interface';
import { Type, applyDecorators } from '@nestjs/common';

export const CrudRepository = <Entity>(target: Type<Entity>) =>
  applyDecorators(SetEntityRecipeMetadata(target, 'repository'));
