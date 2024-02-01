import { CrudAutoModule } from '@/crud-auto.module';
import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { ClassName } from '@Decorators/class-name.decorator';
import { IDtoRecipe } from '@Interfaces/i-dto-recipe.interface';
import { Injectable, Type } from '@nestjs/common';
import { capitalCase } from 'change-case';

export function crudProfileFor<Entity>(
  target: Type<Entity>,
): Type<AutomapperProfile> {
  const { createDto, returnDto }: IDtoRecipe<Entity> =
    CrudAutoModule.dtosFor(target);
  @Injectable()
  @ClassName(`${capitalCase(target.name)}Profile`)
  class CrudProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
      super(mapper);
    }

    override get profile() {
      return (mapper) => {
        createMap(mapper, createDto, target);
        createMap(mapper, target, returnDto);
      };
    }
  }
  return CrudProfile;
}
