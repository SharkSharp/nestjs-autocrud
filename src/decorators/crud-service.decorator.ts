import { SetEntityRecipeMetadata } from '@Interfaces/i-entity-recipe.interface';
import { Type, applyDecorators } from '@nestjs/common';

export const CrudService = <Entity>(target: Type<Entity>) =>
  applyDecorators(SetEntityRecipeMetadata(target, 'service'));
