import { CrudAutoloader } from '@/crud-autoloader.class';
import { crudControllerFor } from '@/crud.controller';
import { crudProfileFor } from '@/crud.profile';
import { ICrudRepository } from '@/crud.repository';
import { ICrudService, crudServiceFor } from '@/crud.service';
import { DtoRecipe } from '@/dto-recipe.class';
import { crudRepositoryNameFor } from '@Decorators/inject-crud-repository.decorator';
import { crudServiceNameFor } from '@Decorators/inject-crud-service.decorator';
import { DeepPartial } from '@Helpers/mapped-types/deep-partial.interface';
import { ICrudAutoModuleOptions } from '@Interfaces/i-crud-auto-module-options.interface';
import {
  ApiLayers,
  ICrudModuleOptions,
  IEntityAutoCrudOptions,
  isEntityAutoModuleOptions,
} from '@Interfaces/i-crud-module-options.interface';
import { IDictionary } from '@Interfaces/i-dictionary.interface';
import { IDtoRecipe } from '@Interfaces/i-dto-recipe.interface';
import { IEndpointsRecipe } from '@Interfaces/i-endpoints-recipe.interface';
import { IEntityRecipe } from '@Interfaces/i-entity-recipe.interface';
import { IPaginatedResult } from '@Interfaces/i-paginated-result.interface';
import { DynamicModule, Module, Type } from '@nestjs/common';

@Module({})
export class CrudAutoModule {
  private static loadedDtos: IDictionary<IDtoRecipe> = {};
  private static dtoLoaded = false;
  private static loadedRecipes: IDictionary<IEntityRecipe> = {};
  private static recipeLoaded = false;
  private static moduleOptions: ICrudAutoModuleOptions = {
    autoimportModules: true,
    apiLayer: ApiLayers.REST,
    endpointsRecipe: {
      create: true,
      delete: true,
      findAll: true,
      findById: true,
      update: true,
    },
    crudRepositoryFor: null,
    orm: null,
  };
  private static resolve;
  private static semaphore = new Promise<void>(
    (resolve) => (CrudAutoModule.resolve = resolve),
  );

  public static getRouteFor<Entity>(target: Type<Entity>) {
    if (Object.keys(this.loadedRecipes).includes(target.name)) {
      const controller = this.loadedRecipes[target.name].controller;
      return Reflect.getMetadata('path', controller);
    }
  }

  public static crudControllerFor<
    Entity,
    CreateDto = any,
    UpdateDto extends DeepPartial<Entity> = any,
    ReturnDto = Entity,
    PaginatedResultDto extends IPaginatedResult<ReturnDto> = IPaginatedResult<ReturnDto>,
    Service extends ICrudService<
      Entity,
      CreateDto,
      UpdateDto,
      ReturnDto,
      PaginatedResultDto
    > = ICrudService<
      Entity,
      CreateDto,
      UpdateDto,
      ReturnDto,
      PaginatedResultDto
    >,
  >(target: Type<Entity>, endpointsRecipe?: IEndpointsRecipe) {
    return crudControllerFor<
      Entity,
      CreateDto,
      UpdateDto,
      ReturnDto,
      PaginatedResultDto,
      Service
    >(target, this.dtosFor(target), endpointsRecipe);
  }

  public static crudServiceFor<
    Entity,
    TRepository extends ICrudRepository<Entity> = ICrudRepository<Entity>,
    CreateDto = any,
    UpdateDto extends DeepPartial<Entity> = any,
    ReturnDto = Entity,
    PaginatedResultDto extends IPaginatedResult<ReturnDto> = IPaginatedResult<ReturnDto>,
  >(target: Type<Entity>) {
    return crudServiceFor<
      Entity,
      TRepository,
      CreateDto,
      UpdateDto,
      ReturnDto,
      PaginatedResultDto
    >(target, this.dtosFor(target));
  }

  public static crudProfileFor<Entity>(target: Type<Entity>) {
    return crudProfileFor<Entity>(target, this.dtosFor(target));
  }

  private static dtosFor(target: Type<any>): IDtoRecipe {
    if (!this.dtoLoaded) {
      this.loadedDtos = CrudAutoloader.autoloadDtos();
      this.dtoLoaded = true;
    }
    if (!this.loadedDtos[target.name]) {
      this.loadedDtos[target.name] = new DtoRecipe(target);
    }
    return this.loadedDtos[target.name];
  }

  private static recipeFor(target: Type<any>): IEntityRecipe {
    if (!this.recipeLoaded) {
      this.loadedRecipes = CrudAutoloader.autoloadRecipes();
      this.recipeLoaded = true;
    }
    if (!this.loadedRecipes[target.name]) {
      this.loadedRecipes[target.name] = {};
    }
    return this.loadedRecipes[target.name];
  }

  static async forFeatureAsync({
    entities,
    apiLayer,
    endpointsRecipe,
    imports = [],
    exports = [],
    controllers = [],
    providers = [],
  }: ICrudModuleOptions): Promise<DynamicModule> {
    const builtEntities = entities.map((entity) =>
      isEntityAutoModuleOptions(entity)
        ? entity
        : { entity, apiLayer: apiLayer ?? this.moduleOptions.apiLayer },
    );
    const rawEntities = builtEntities.map(({ entity }) => entity);

    await this.semaphore;

    const builtProviders = this.providersFor(builtEntities);
    const builtProfiles = this.profilesFor(builtEntities);

    return {
      module: CrudAutoModule,
      imports: [...imports, this.moduleOptions.orm.ormModuleFor(rawEntities)],
      providers: [...providers, ...builtProviders, ...builtProfiles],
      controllers: [
        ...controllers,
        ...this.controllersFor(builtEntities, endpointsRecipe),
      ],
      exports: [
        ...exports,
        ...builtProviders,
        ...builtProfiles,
        this.moduleOptions.orm.ormModule,
      ],
    };
  }

  static forRoot(
    crudAutoModuleOptions?: ICrudAutoModuleOptions,
  ): DynamicModule {
    this.resolve();
    CrudAutoModule.moduleOptions = {
      ...CrudAutoModule.moduleOptions,
      ...(crudAutoModuleOptions ?? {}),
    };
    const autoloadedModules: Array<Type<any>> = [];
    if (crudAutoModuleOptions.autoimportModules) {
      autoloadedModules.push(...CrudAutoloader.autoloadModules());
    }
    return {
      imports: autoloadedModules,
      module: CrudAutoModule,
      exports: autoloadedModules,
    };
  }

  private static providersFor(targets: Array<IEntityAutoCrudOptions>) {
    return targets.flatMap(({ entity }) => [
      this.repositoryFor(entity),
      this.serviceFor(entity),
    ]);
  }

  private static profilesFor(targets: Array<IEntityAutoCrudOptions>) {
    return targets.map(({ entity }) => this.profileFor(entity));
  }

  private static controllersFor(
    targets: Array<IEntityAutoCrudOptions>,
    moduleEndpointsRecipe: IEndpointsRecipe,
  ) {
    return targets.flatMap(({ entity, endpointsRecipe, apiLayer }) =>
      !apiLayer || ApiLayers.REST
        ? this.controllerFor(
            entity,
            endpointsRecipe ??
              moduleEndpointsRecipe ??
              this.moduleOptions.endpointsRecipe,
          )
        : [],
    );
  }

  private static controllerFor(
    target: Type<any>,
    endpointsRecipe: IEndpointsRecipe,
  ) {
    return (
      this.recipeFor(target)?.controller ??
      (this.recipeFor(target).controller =
        this.moduleOptions.crudControllerFor?.(target, endpointsRecipe) ??
        crudControllerFor(target, this.dtosFor(target), endpointsRecipe))
    );
  }

  private static repositoryFor<Entity>(target: Type<Entity>) {
    const repositoryType =
      this.recipeFor(target)?.repository ??
      (this.recipeFor(target).repository =
        this.moduleOptions.crudRepositoryFor(target));
    return {
      provide: crudRepositoryNameFor(target),
      useClass: repositoryType,
    };
  }

  private static serviceFor<Entity>(target: Type<Entity>) {
    const serviceType =
      this.recipeFor(target)?.service ??
      (this.recipeFor(target).service =
        this.moduleOptions.crudServiceFor?.(target) ??
        crudServiceFor(target, this.dtosFor(target)));
    return {
      provide: crudServiceNameFor(target),
      useClass: serviceType,
    };
  }

  private static profileFor<Entity>(target: Type<Entity>) {
    const profileClass =
      this.recipeFor(target)?.mapperProfile ??
      (this.recipeFor(target).mapperProfile =
        this.moduleOptions.crudProfileFor?.(target) ??
        crudProfileFor(target, this.dtosFor(target)));
    return {
      provide: `CrudProfile<${target.name}>`,
      useClass: profileClass,
    };
  }
}
