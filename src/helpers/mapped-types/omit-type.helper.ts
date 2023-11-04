import { inheritAutoMapMetadata } from '@Helpers/mapped-types/type.helper';
import { Type } from '@nestjs/common';
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';

const modelPropertiesAccessor = new ModelPropertiesAccessor();

export function OmitType<T, K extends keyof T>(
  classRef: Type<T>,
  keys: readonly K[],
  className?: string,
): Type<Omit<T, (typeof keys)[number]>> {
  const fields = modelPropertiesAccessor
    .getModelProperties(classRef.prototype)
    .filter((item) => !keys.includes(item as K));
  const isInheritedPredicate = (propertyKey: string) =>
    !keys.includes(propertyKey as K);
  abstract class OmitTypeClass {
    constructor() {
      inheritPropertyInitializers(this, classRef, isInheritedPredicate);
    }
  }

  if (className) {
    Object.defineProperty(OmitTypeClass, 'name', { value: className });
  }

  inheritValidationMetadata(classRef, OmitTypeClass, isInheritedPredicate);
  inheritTransformationMetadata(classRef, OmitTypeClass, isInheritedPredicate);
  inheritAutoMapMetadata(classRef, OmitTypeClass, isInheritedPredicate);

  fields.forEach((propertyKey) => {
    const metadata = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      classRef.prototype,
      propertyKey,
    );
    const decoratorFactory = ApiProperty(metadata);
    decoratorFactory(OmitTypeClass.prototype, propertyKey);
  });

  return OmitTypeClass as Type<Omit<T, (typeof keys)[number]>>;
}
