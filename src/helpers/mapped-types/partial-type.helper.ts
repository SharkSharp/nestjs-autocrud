import { inheritAutoMapMetadata } from '@Helpers/mapped-types/type.helper';
import { Type } from '@nestjs/common';
import {
  applyIsOptionalDecorator,
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';

const modelPropertiesAccessor = new ModelPropertiesAccessor();

export function PartialType<T>(
  classRef: Type<T>,
  className?: string,
): Type<Partial<T>> {
  const fields = modelPropertiesAccessor.getModelProperties(classRef.prototype);
  abstract class PartialTypeClass {
    constructor() {
      inheritPropertyInitializers(this, classRef);
    }
  }

  if (className) {
    Object.defineProperty(PartialTypeClass, 'name', { value: className });
  }

  inheritValidationMetadata(classRef, PartialTypeClass);
  inheritTransformationMetadata(classRef, PartialTypeClass);
  inheritAutoMapMetadata(classRef, PartialTypeClass);

  fields.forEach((key) => {
    const metadata =
      Reflect.getMetadata(
        DECORATORS.API_MODEL_PROPERTIES,
        classRef.prototype,
        key,
      ) || {};

    const decoratorFactory = ApiProperty({
      ...metadata,
      required: false,
    });
    decoratorFactory(PartialTypeClass.prototype, key);
    applyIsOptionalDecorator(PartialTypeClass, key);
  });

  return PartialTypeClass as Type<Partial<T>>;
}
