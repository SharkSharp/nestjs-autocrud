import { DeepPartial } from '@Helpers/mapped-types/deep-partial.interface';
import { IPaginatedResult } from '@Interfaces/i-paginated-result.interface';
import { IPagination } from '@Interfaces/i-pagination.interface';

export interface ICrudRepository<Entity> {
  findById(id: number, ...args: any[]): Promise<Entity>;
  findOneBy(entity: Partial<Entity>, ...args: any[]);
  findBy(entity: Partial<Entity>, ...args: any[]);
  findAll(
    pagination: IPagination,
    ...args: any[]
  ): Promise<IPaginatedResult<Entity>>;
  create(model: Entity, ...args: any[]): Promise<Entity>;
  update(
    mergeIntoEntity: Entity,
    model: DeepPartial<Entity>,
    ...args: any[]
  ): Promise<Entity>;
  softDelete(id: number, ...args: any[]): Promise<void>;
}
