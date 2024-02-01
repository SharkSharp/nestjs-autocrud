import { ICrudRepository } from '@/crud.repository';
import { ICrudService } from '@/crud.service';
import { DeepPartial } from '@Helpers/mapped-types/deep-partial.interface';
import { IAutoCrudOptions } from '@Interfaces/i-crud-module-options.interface';
import { IEndpointsRecipe } from '@Interfaces/i-endpoints-recipe.interface';
import { IPaginatedResult } from '@Interfaces/i-paginated-result.interface';
import { AutomapperProfile } from '@automapper/nestjs';
import { DynamicModule, ForwardReference, Type } from '@nestjs/common';

export interface ICrudAutoModuleOptions extends IAutoCrudOptions {
  autoimportModules?: boolean;
  orm: {
    ormModule: Type<any>;
    ormModuleFor: <Entity>(
      entities: Array<Type<Entity>>,
    ) => Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference;
  };
  crudRepositoryFor: <Entity>(
    target: Type<Entity>,
  ) => Type<ICrudRepository<Entity>>;
  crudProfileFor?: <Entity>(target: Type<Entity>) => Type<AutomapperProfile>;
  crudServiceFor?: <
    Entity,
    K extends string | number | symbol = 'id',
    CreateDto = Omit<Entity, K>,
    UpdateDto extends DeepPartial<Entity> = DeepPartial<Entity>,
    ReturnDto = Entity,
    PaginatedResultDto extends IPaginatedResult<ReturnDto> = IPaginatedResult<ReturnDto>,
  >(
    target: Type<Entity>,
  ) => Type<
    ICrudService<Entity, K, CreateDto, UpdateDto, ReturnDto, PaginatedResultDto>
  >;
  crudControllerFor?: <Entity>(
    target: Type<Entity>,
    endpointsRecipe?: IEndpointsRecipe,
  ) => Type<any>;
}
