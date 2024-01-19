import { IEndpointsRecipe } from '@Interfaces/i-endpoints-recipe.interface';
import { ModuleMetadata, Type } from '@nestjs/common';

export const CRUD_MODULE = 'CRUD_MODULE';
export enum ApiLayers {
  NONE = 0,
  REST = 1,
  GRAPHQL = 2,
  ALL = 3,
}

export interface IAutoCrudOptions<
  EndpointsRecipe extends IEndpointsRecipe = IEndpointsRecipe,
> {
  apiLayer?: ApiLayers;
  endpointsRecipe?: EndpointsRecipe;
}

export interface IEntityAutoCrudOptions<
  EndpointsRecipe extends IEndpointsRecipe = IEndpointsRecipe,
> extends IAutoCrudOptions<EndpointsRecipe> {
  entity: Type<any>;
}
export const isEntityAutoModuleOptions = <
  EndpointsRecipe extends IEndpointsRecipe = IEndpointsRecipe,
>(
  obj: any,
): obj is IEntityAutoCrudOptions<EndpointsRecipe> => {
  return obj && obj.entity;
};
export interface ICrudModuleOptions<
  EndpointsRecipe extends IEndpointsRecipe = IEndpointsRecipe,
> extends ModuleMetadata,
    IAutoCrudOptions<EndpointsRecipe> {
  entities: (Type<any> | IEntityAutoCrudOptions<EndpointsRecipe>)[];
}

export interface ICrudAutoModuleForFeatureOptions<
  EndpointsRecipe extends IEndpointsRecipe = IEndpointsRecipe,
> extends ICrudModuleOptions<EndpointsRecipe> {
  moduleRef: Type<any>;
}
