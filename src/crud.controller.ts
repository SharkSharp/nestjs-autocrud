import { CrudAutoModule } from '@/crud-auto.module';
import { ICrudService } from '@/crud.service';
import { PaginationDto } from '@/dtos/pagination.dto';
import { InjectUpdateIdInterceptor } from '@/update-id.interceptor';
import { ClassName } from '@Decorators/class-name.decorator';
import { InjectCrudService } from '@Decorators/inject-crud-service.decorator';
import { Optional } from '@Decorators/optional.decorator';
import { UnauthorizedDto } from '@Dtos/errors.dto';
import { DeepPartial } from '@Helpers/mapped-types/deep-partial.interface';
import { IDtoRecipe } from '@Interfaces/i-dto-recipe.interface';
import { IEndpointsRecipe } from '@Interfaces/i-endpoints-recipe.interface';
import { IPaginatedResult } from '@Interfaces/i-paginated-result.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Type,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { capitalCase, paramCase } from 'change-case';

export const crudControllerFor = <
  Entity,
  CreateDto = Omit<Entity, 'id'>,
  UpdateDto extends DeepPartial<Entity> = DeepPartial<Entity>,
  ReturnDto = Entity,
  PaginatedResultDto extends IPaginatedResult<ReturnDto> = IPaginatedResult<ReturnDto>,
  Service extends ICrudService<
    Entity,
    CreateDto,
    UpdateDto,
    ReturnDto,
    PaginatedResultDto
  > = ICrudService<Entity, CreateDto, UpdateDto, ReturnDto, PaginatedResultDto>,
>(
  target: Type<Entity>,
  {
    create = true,
    findAll = true,
    findById = true,
    update = true,
    delete: _delete = true,
  }: IEndpointsRecipe = {},
) => {
  const targetDtoRecipe: IDtoRecipe<
    Entity,
    CreateDto,
    UpdateDto,
    ReturnDto,
    PaginatedResultDto
  > = CrudAutoModule.dtosFor(target);

  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiTags(capitalCase(target.name))
  @Controller(paramCase(target.name))
  @ClassName(`${capitalCase(target.name)}Controller`)
  class BaseController {
    public static readonly dtoRecipe = targetDtoRecipe;

    @InjectCrudService(target)
    readonly crudService: Service;

    @Optional(Post(), create)
    @ApiBody({ type: targetDtoRecipe.createDto, required: true })
    @ApiResponse({
      type: targetDtoRecipe.createDto,
      status: 201,
      description: 'Created',
    })
    @UsePipes(
      new ValidationPipe({
        expectedType: targetDtoRecipe.createDto,
        transform: true,
      }),
    )
    async create(
      @Body()
      modelDto: CreateDto,
    ): Promise<ReturnDto> {
      return await this.crudService.create(modelDto);
    }

    @Optional(Get(), findAll)
    @ApiResponse({
      type: targetDtoRecipe.paginatedResultDto,
      status: 200,
      description: 'Found',
    })
    async findAll(
      @Query() pagination: PaginationDto,
    ): Promise<PaginatedResultDto> {
      return await this.crudService.findAll(pagination);
    }

    @Optional(Get(':id'), findById)
    @ApiResponse({
      type: targetDtoRecipe.returnDto,
      status: 200,
      description: 'Found',
    })
    async findById(@Param('id') id: number): Promise<ReturnDto> {
      return await this.crudService.findById(id);
    }

    @Optional(Put(':id'), update)
    @ApiBody({ type: targetDtoRecipe.updateDto, required: true })
    @ApiResponse({
      type: targetDtoRecipe.returnDto,
      status: 200,
      description: 'Updated',
    })
    @UseInterceptors(new InjectUpdateIdInterceptor())
    @UsePipes(
      new ValidationPipe({
        expectedType: targetDtoRecipe.updateDto,
        transform: true,
      }),
    )
    async update(
      @Param('id') id: number,
      @Body() updateDto: UpdateDto,
    ): Promise<ReturnDto> {
      return await this.crudService.update(id, updateDto);
    }

    @Optional(Delete(':id'), _delete)
    async delete(@Param('id') id: number) {
      return await this.crudService.softDelete(id);
    }
  }
  return BaseController;
};
