import { DtoRecipe } from '@/dto-recipe.class';
import { listFileByDecorators } from '@Helpers/file.helper';
import { CRUD_MODULE } from '@Interfaces/i-crud-module-options.interface';
import { IDictionary } from '@Interfaces/i-dictionary.interface';
import {
  CRUD_DTO_RECIPE,
  IDtoRecipe,
} from '@Interfaces/i-dto-recipe.interface';
import {
  CRUD_ENTITY_RECIPE,
  IEntityRecipe,
} from '@Interfaces/i-entity-recipe.interface';
import { IRecipeMetadata } from '@Interfaces/i-recipe-metadata.interface';
import { Logger, Type } from '@nestjs/common';
import path, { join } from 'path';

const logger = new Logger('CrudAutoloader', { timestamp: true });

export class CrudAutoloader {
  public static autoloadDtos(): IDictionary<IDtoRecipe> {
    logger.log('Starting Dtos Autoload');
    const loadedDtos: IDictionary<IDtoRecipe> = {};
    const dtoFiles = listFileByDecorators(
      join(process.cwd(), 'dist'),
      ['CrudDto'],
      ['.dto.js'],
    );
    this.autoload(
      dtoFiles,
      (autoloaded, metadata) => {
        if (!loadedDtos[metadata.target.name]) {
          loadedDtos[metadata.target.name] = new DtoRecipe(metadata.target);
        }
        loadedDtos[metadata.target.name][metadata.prop] = autoloaded;
      },
      CRUD_DTO_RECIPE,
    );
    logger.log('Dtos Autoload Finished');
    return loadedDtos;
  }

  public static autoloadRecipes(): IDictionary<IEntityRecipe> {
    logger.log('Starting Recipes Autoload');
    const loadedRecipes: IDictionary<IEntityRecipe> = {};
    const recipeFiles = listFileByDecorators(
      join(process.cwd(), 'dist'),
      ['CrudController', 'CrudService', 'CrudRepository', 'CrudProfile'],
      ['.controller.js', '.service.js', '.repository.js', '.profile.js'],
    );
    this.autoload(
      recipeFiles,
      (autoloaded, metadata) => {
        if (!loadedRecipes[metadata.target.name]) {
          loadedRecipes[metadata.target.name] = {};
        }
        loadedRecipes[metadata.target.name][metadata.prop] = autoloaded;
      },
      CRUD_ENTITY_RECIPE,
    );
    logger.log('Recipes Autoload Finished');
    return loadedRecipes;
  }

  public static autoloadModules(): Array<Type<any>> {
    logger.log('Starting Modules Autoload');
    const moduleFiles = listFileByDecorators(
      join(process.cwd(), 'dist'),
      ['CrudModule'],
      ['.module.js'],
    );
    const loadedModules: Array<Type<any>> = [];
    this.autoload(
      moduleFiles,
      (autoload) => loadedModules.push(autoload),
      CRUD_MODULE,
    );
    logger.log('Modules Autoload Finished');
    return loadedModules;
  }

  private static autoload(
    actualFiles: string[],
    itemAssignment: (autoloaded: Type<any>, metadata: IRecipeMetadata) => void,
    metadataKey: string,
  ) {
    const loadedModules = Object.entries(require.cache).filter(([key]) =>
      actualFiles.some((x) => key.endsWith(x)),
    );
    if (loadedModules.length > 0) {
      logger.log('Modules already loaded:');
      loadedModules.forEach(([filePath]) =>
        logger.log(` - ${path.basename(filePath)}`),
      );
    }
    const unloadedFiles = actualFiles.filter(
      (x) => !loadedModules.some(([path]) => path === x),
    );
    logger.log(`Loading...:`);
    const modules = unloadedFiles
      .map((x) => {
        logger.log(` - ${path.basename(x)}`);
        return require(x);
      })
      .concat(loadedModules.map(([, value]) => value.exports));

    modules.forEach((module) => {
      Object.values(module)
        .filter((x) => typeof x === 'function')
        .forEach((item: Type<any>) => {
          if (!item) throw new Error('Module not loaded');
          if (Reflect.hasMetadata(metadataKey, item)) {
            const metadata: IRecipeMetadata = Reflect.getMetadata(
              metadataKey,
              item,
            );
            itemAssignment(item, metadata);
          }
        });
    });
  }
}
