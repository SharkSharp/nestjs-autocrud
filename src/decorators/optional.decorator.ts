import { applyDecorators } from '@nestjs/common';

export const Optional = (
  decorators: ClassDecorator | MethodDecorator | PropertyDecorator,
  shouldApply,
) =>
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  shouldApply ? applyDecorators(decorators) : () => {};
