import { SetEntityRecipeMetadata } from '@Interfaces/i-entity-recipe.interface';
import { Type, applyDecorators } from '@nestjs/common';

export const CrudProfile = <Entity>(target: Type<Entity>) =>
  applyDecorators(SetEntityRecipeMetadata(target, 'mapperProfile'));
