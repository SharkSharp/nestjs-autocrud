import {
  IDtoRecipe,
  SetDtoRecipeMetadata,
} from '@Interfaces/i-dto-recipe.interface';
import { Type, applyDecorators } from '@nestjs/common';

export const CrudDto = <Entity>(
  target: Type<Entity>,
  type: keyof IDtoRecipe<Entity>,
) => applyDecorators(SetDtoRecipeMetadata(target, type));
