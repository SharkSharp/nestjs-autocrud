import { CrudAutoModule } from '@/crud-auto.module';
import {
  CRUD_MODULE,
  ICrudModuleOptions,
} from '@Interfaces/i-crud-module-options.interface';
import { Module, SetMetadata, applyDecorators } from '@nestjs/common';

export const CrudModule = (crudModuleOptions: ICrudModuleOptions) => {
  const module = CrudAutoModule.forFeatureAsync(crudModuleOptions);
  return applyDecorators(
    Module({
      imports: [module],
      exports: [CrudAutoModule],
    }),
    SetMetadata(CRUD_MODULE, true),
  );
};
