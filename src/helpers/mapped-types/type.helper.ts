import {
  AUTOMAP_PROPERTIES_METADATA_KEY,
  getMetadataList,
} from '@automapper/classes';
import { AutoMapperLogger } from '@automapper/core';
import { Type } from '@nestjs/common';

export function inheritAutoMapMetadata(
  parentClass: Type<any>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  targetClass: Function,
  isPropertyInherited: (key: string) => boolean = () => true,
) {
  try {
    const [parentClassMetadataList] = getMetadataList(parentClass);
    if (!parentClassMetadataList.length) {
      return;
    }

    const [existingMetadataList] = getMetadataList(targetClass as Type<any>);
    Reflect.defineMetadata(
      AUTOMAP_PROPERTIES_METADATA_KEY,
      [
        ...existingMetadataList,
        ...parentClassMetadataList.filter(([propertyKey]) =>
          isPropertyInherited(propertyKey),
        ),
      ],
      targetClass,
    );
  } catch (e) {
    if (AutoMapperLogger.error) {
      AutoMapperLogger.error(`Error trying to inherit metadata: ${e}`);
    }
  }
}
