import { SetEntityRecipeMetadata } from '@Interfaces/i-entity-recipe.interface';
import { Type, applyDecorators } from '@nestjs/common';

export const CrudController = <Entity>(target: Type<Entity>) =>
  applyDecorators(SetEntityRecipeMetadata(target, 'controller'));
