import { SetEntityRecipeMetadata } from '@Interfaces/i-entity-recipe.interface';
import { Type, applyDecorators } from '@nestjs/common';

export interface ICrudControllerOptions {
  noService?: boolean;
}

export const CrudController = <Entity>(
  target: Type<Entity>,
  options?: ICrudControllerOptions,
) => applyDecorators(SetEntityRecipeMetadata(target, 'controller', options));
