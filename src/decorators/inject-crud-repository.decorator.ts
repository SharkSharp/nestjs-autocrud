import { Inject, Type } from '@nestjs/common';

export const crudRepositoryNameFor = <Entity>(target: Type<Entity>): string =>
  `ICrudRepository<${target.name}>`;

export const InjectCrudRepository = (entity: Type<any>) =>
  Inject(crudRepositoryNameFor(entity));

export const crudRepositoryProviderFor = <Entity>(target: Type<Entity>) => ({
  provide: crudRepositoryNameFor(target),
  useClass: target,
});
