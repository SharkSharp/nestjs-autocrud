import { CrudAutoloader } from '@/crud-autoloader.class';
import { crudControllerFor } from '@/crud.controller';
import { crudProfileFor } from '@/crud.profile';
import { crudServiceFor } from '@/crud.service';
import { DtoRecipe } from '@/dto-recipe.class';
import { MODULE_REF } from '@Decorators/crud-module.decorator';
import { crudRepositoryNameFor } from '@Decorators/inject-crud-repository.decorator';
import { crudServiceNameFor } from '@Decorators/inject-crud-service.decorator';
import { DeepPartial } from '@Helpers/mapped-types';
import { ICrudAutoModuleOptions } from '@Interfaces/i-crud-auto-module-options.interface';
import {
  ApiLayers,
  ICrudAutoModuleForFeatureOptions,
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
  private static loadedDtos: IDictionary<IDtoRecipe<unknown>>;
  private static loadedRecipes: IDictionary<IEntityRecipe<unknown>>;
  private static moduleOptions: Promise<ICrudAutoModuleOptions> =
    new Promise<ICrudAutoModuleOptions>(
      (resolve) =>
        (CrudAutoModule.resolve = (options = {}) =>
          resolve({
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
            ...options,
          })),
    ) as Promise<ICrudAutoModuleOptions>;
  private static resolve: (
    value:
      | Partial<ICrudAutoModuleOptions>
      | PromiseLike<Partial<ICrudAutoModuleOptions>>,
  ) => void;

  public static getRouteFor<Entity>(target: Type<Entity>) {
    if (
      Object.keys(this.loadedRecipes).includes(target.name) &&
      this.loadedRecipes[target.name].controller
    ) {
      const controller = this.loadedRecipes[target.name].controller;
      return Reflect.getMetadata('path', controller);
    } else {
      throw new Error(
        `The controller for ${target.name} is not loaded in the CrudAutoModule`,
      );
    }
  }

  public static dtosFor<
    Entity,
    CreateDto = Omit<Entity, 'id'>,
    UpdateDto extends DeepPartial<Entity> = DeepPartial<Entity>,
    ReturnDto = Entity,
    PaginatedResultDto extends IPaginatedResult<ReturnDto> = IPaginatedResult<ReturnDto>,
  >(
    target: Type<Entity>,
  ): IDtoRecipe<Entity, CreateDto, UpdateDto, ReturnDto, PaginatedResultDto> {
    if (!this.loadedDtos) {
      this.loadedDtos = CrudAutoloader.autoloadDtos();
    }
    if (!(target.name in this.loadedDtos)) {
      this.loadedDtos[target.name] = new DtoRecipe(target);
    }
    return this.loadedDtos[target.name] as IDtoRecipe<
      Entity,
      CreateDto,
      UpdateDto,
      ReturnDto,
      PaginatedResultDto
    >;
  }

  public static recipeFor<Entity>(target: Type<Entity>): IEntityRecipe<Entity> {
    if (!this.loadedRecipes) {
      this.loadedRecipes = CrudAutoloader.autoloadRecipes();
    }
    if (!(target.name in this.loadedRecipes)) {
      this.loadedRecipes[target.name] = {};
    }
    return this.loadedRecipes[target.name] as IEntityRecipe<Entity>;
  }

  static async forFeatureAsync({
    entities,
    apiLayer,
    endpointsRecipe,
    imports = [],
    exports = [],
    controllers = [],
    providers = [],
    moduleRef,
  }: ICrudAutoModuleForFeatureOptions): Promise<DynamicModule> {
    const currentOptions = await this.moduleOptions;
    const builtEntities = entities.map((entity) =>
      isEntityAutoModuleOptions(entity)
        ? entity
        : <IEntityAutoCrudOptions<unknown>>{
            entity,
            apiLayer: apiLayer ?? currentOptions.apiLayer,
          },
    );
    const rawEntities = builtEntities.map(({ entity }) => entity);

    const builtProviders = await this.providersFor(builtEntities);
    const builtProfiles = await this.profilesFor(builtEntities);
    const builtControllers = await this.controllersFor(
      builtEntities,
      endpointsRecipe,
    );

    builtControllers.forEach((controller) => {
      Reflect.defineMetadata(MODULE_REF, moduleRef, controller);
    });

    return {
      module: CrudAutoModule,
      imports: [...imports, currentOptions.orm.ormModuleFor(rawEntities)],
      providers: [...providers, ...builtProviders, ...builtProfiles],
      controllers: [...controllers, ...builtControllers],
      exports: [
        ...exports,
        ...builtProviders,
        ...builtProfiles,
        currentOptions.orm.ormModule,
      ],
    };
  }

  static forRoot<
    CrudAutoModuleOptions extends ICrudAutoModuleOptions = ICrudAutoModuleOptions,
  >(crudAutoModuleOptions?: CrudAutoModuleOptions): DynamicModule {
    //TODO: implementar o ORM Agnostic
    this.resolve(crudAutoModuleOptions);

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

  private static async providersFor(
    targets: Array<IEntityAutoCrudOptions<unknown>>,
  ) {
    return await Promise.all(
      targets.flatMap(({ entity }) => [
        this.repositoryFor(entity),
        this.serviceFor(entity),
      ]),
    );
  }

  private static async profilesFor(
    targets: Array<IEntityAutoCrudOptions<unknown>>,
  ) {
    return await Promise.all(
      targets.map(({ entity }) => this.profileFor(entity)),
    );
  }

  private static async controllersFor(
    targets: Array<IEntityAutoCrudOptions<unknown>>,
    moduleEndpointsRecipe: IEndpointsRecipe,
  ) {
    const currentOptions = await this.moduleOptions;
    return await Promise.all(
      targets.flatMap(({ entity, endpointsRecipe, apiLayer }) =>
        apiLayer === undefined || apiLayer & ApiLayers.REST
          ? this.controllerFor(entity, {
              ...currentOptions.endpointsRecipe,
              ...moduleEndpointsRecipe,
              ...endpointsRecipe,
            })
          : [],
      ),
    );
  }

  private static async controllerFor(
    target: Type<any>,
    endpointsRecipe: IEndpointsRecipe,
  ) {
    const currentOptions = await this.moduleOptions;
    return (
      this.recipeFor(target)?.controller ??
      (this.recipeFor(target).controller =
        currentOptions.crudControllerFor?.(target, endpointsRecipe) ??
        crudControllerFor(target, endpointsRecipe))
    );
  }

  private static async repositoryFor(target: Type<any>) {
    const currentOptions = await this.moduleOptions;
    const repositoryType =
      this.recipeFor(target)?.repository ??
      (this.recipeFor(target).repository =
        currentOptions.crudRepositoryFor(target));
    return {
      provide: crudRepositoryNameFor(target),
      useClass: repositoryType,
    };
  }

  private static async serviceFor(target: Type<any>) {
    const currentOptions = await this.moduleOptions;
    const serviceType =
      this.recipeFor(target)?.service ??
      (this.recipeFor(target).service =
        currentOptions.crudServiceFor?.(target) ?? crudServiceFor(target));
    return {
      provide: crudServiceNameFor(target),
      useClass: serviceType,
    };
  }

  private static async profileFor(target: Type<any>) {
    const currentOptions = await this.moduleOptions;
    const profileClass =
      this.recipeFor(target)?.mapperProfile ??
      (this.recipeFor(target).mapperProfile =
        currentOptions.crudProfileFor?.(target) ?? crudProfileFor(target));
    return {
      provide: `CrudProfile<${target.name}>`,
      useClass: profileClass,
    };
  }
}
