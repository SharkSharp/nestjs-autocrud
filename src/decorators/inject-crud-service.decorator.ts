import { Inject, Type } from '@nestjs/common';

export const crudServiceNameFor = <Entity>(target: Type<Entity>): string =>
  `ICrudService<${target.name}>`;

export const InjectCrudService = (entity: Type<any>) =>
  Inject(crudServiceNameFor(entity));

export const crudServiceProviderFor = <Entity>(
  target: Type<Entity>,
  service: Type<any>,
) => ({
  provide: crudServiceNameFor(target),
  useClass: service,
});
