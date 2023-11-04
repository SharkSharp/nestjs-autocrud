import { IEndpointsRecipe } from '@Interfaces/i-endpoints-recipe.interface';
import { ModuleMetadata, Type } from '@nestjs/common';

export const CRUD_MODULE = 'CRUD_MODULE';
export enum ApiLayers {
  NONE = 0,
  REST = 1,
}

export interface IAutoCrudOptions {
  apiLayer?: ApiLayers;
  endpointsRecipe?: IEndpointsRecipe;
}

export interface IEntityAutoCrudOptions extends IAutoCrudOptions {
  entity: Type<any>;
}
export const isEntityAutoModuleOptions = (
  obj: any,
): obj is IEntityAutoCrudOptions => {
  return obj && obj.entity;
};
export interface ICrudModuleOptions extends ModuleMetadata, IAutoCrudOptions {
  entities: (Type<any> | IEntityAutoCrudOptions)[];
}
