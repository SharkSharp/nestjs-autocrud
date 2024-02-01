import { CrudAutoModule } from '@/crud-auto.module';
import { ICrudRepository } from '@/crud.repository';
import { ClassName } from '@Decorators/class-name.decorator';
import { InjectCrudRepository } from '@Decorators/inject-crud-repository.decorator';
import throwEx from '@Helpers/functions/throwEx.helper';
import { DeepPartial } from '@Helpers/mapped-types/deep-partial.interface';
import { IDtoRecipe } from '@Interfaces/i-dto-recipe.interface';
import { IPaginatedResult } from '@Interfaces/i-paginated-result.interface';
import { IPagination } from '@Interfaces/i-pagination.interface';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, NotFoundException, Type } from '@nestjs/common';
import { capitalCase } from 'change-case';

export interface ICrudService<
  Entity,
  CreateDto = Omit<Entity, 'id'>,
  UpdateDto extends DeepPartial<Entity> = DeepPartial<Entity>,
  ReturnDto = Entity,
  PaginatedResultDto extends IPaginatedResult<ReturnDto> = IPaginatedResult<ReturnDto>,
> {
  findById(id: number, ...args: any[]): Promise<ReturnDto>;
  findAll(pagination: IPagination, ...args: any[]): Promise<PaginatedResultDto>;
  create(model: CreateDto, ...args: any[]): Promise<ReturnDto>;
  update(id: number, model: UpdateDto, ...args: any[]): Promise<ReturnDto>;
  softDelete(id: number, ...args: any[]): Promise<void>;
}

export const crudServiceFor = <
  Entity,
  TRepository extends ICrudRepository<Entity> = ICrudRepository<Entity>,
  CreateDto = Omit<Entity, 'id'>,
  UpdateDto extends DeepPartial<Entity> = DeepPartial<Entity>,
  ReturnDto = Entity,
  PaginatedResultDto extends IPaginatedResult<ReturnDto> = IPaginatedResult<ReturnDto>,
>(
  target: Type<Entity>,
) => {
  const targetDtoRecipe: IDtoRecipe<
    Entity,
    CreateDto,
    UpdateDto,
    ReturnDto,
    PaginatedResultDto
  > = CrudAutoModule.dtosFor(target);

  @Injectable()
  @ClassName(`${capitalCase(target.name)}Service`)
  class BaseService
    implements
      ICrudService<Entity, CreateDto, UpdateDto, ReturnDto, PaginatedResultDto>
  {
    public static readonly dtoRecipe = targetDtoRecipe;

    @InjectCrudRepository(target)
    readonly crudRepository: TRepository;
    @InjectMapper()
    readonly mapper: Mapper;

    async findById(id: number): Promise<ReturnDto> {
      const result =
        (await this.crudRepository.findById(id)) ??
        throwEx(new NotFoundException());
      return this.mapper.map(result, target, targetDtoRecipe.returnDto);
    }

    async findAll(pagination: IPagination): Promise<PaginatedResultDto> {
      const result = await this.crudRepository.findAll(pagination);
      return <PaginatedResultDto>{
        count: result.count,
        data: this.mapper.mapArray(
          result.data,
          target,
          targetDtoRecipe.returnDto,
        ),
      };
    }

    async create(model: CreateDto): Promise<ReturnDto> {
      const entity = this.mapper.map(model, targetDtoRecipe.createDto, target);
      const result = await this.crudRepository.create(entity);
      return this.mapper.map(result, target, targetDtoRecipe.returnDto);
    }

    async update(id: number, model: UpdateDto): Promise<ReturnDto> {
      const entity =
        (await this.crudRepository.findById(id)) ??
        throwEx(new NotFoundException());
      const result = await this.crudRepository.update(entity, model);
      return this.mapper.map(result, target, targetDtoRecipe.returnDto);
    }

    async softDelete(id: number): Promise<void> {
      await this.crudRepository.softDelete(id);
    }
  }
  return BaseService;
};
