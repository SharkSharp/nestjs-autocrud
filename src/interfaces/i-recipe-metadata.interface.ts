import { Type } from '@nestjs/common';

export interface IRecipeMetadata {
  prop?: string;
  target: Type<any>;
}
