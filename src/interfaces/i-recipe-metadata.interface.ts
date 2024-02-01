import { Type } from '@nestjs/common';

export interface IRecipeMetadata<Entity> {
  prop?: string;
  target: Type<Entity>;
}
