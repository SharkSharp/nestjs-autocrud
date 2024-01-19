import { CrudAutoModule } from '@/crud-auto.module';
import {
  CRUD_MODULE,
  ICrudModuleOptions,
} from '@Interfaces/i-crud-module-options.interface';
import { Module, SetMetadata, applyDecorators } from '@nestjs/common';

export const MODULE_REF = 'MODULE_REF';

export const CrudModule = (crudModuleOptions: ICrudModuleOptions) => {
  return applyDecorators((target: any) => {
    const module = CrudAutoModule.forFeatureAsync({
      ...crudModuleOptions,
      moduleRef: target,
    });
    Module({
      imports: [module],
      exports: [CrudAutoModule],
    })(target);
  }, SetMetadata(CRUD_MODULE, true));
};
