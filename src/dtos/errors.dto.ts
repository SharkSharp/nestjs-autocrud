import { ApiProperty } from '@nestjs/swagger';

export interface ErrorDto {
  statusCode: number;
  message: string;
}

export class UnauthorizedDto implements ErrorDto {
  @ApiProperty({
    type: Number,
    example: 401,
    default: 401,
    description: 'The HTTP status code for this error',
  })
  statusCode = 401;
  @ApiProperty({
    type: String,
    example: 'Unauthorized',
    default: 'Unauthorized',
  })
  message = 'Unauthorized';
}

export class ServiceUnavailableDto implements ErrorDto {
  @ApiProperty({
    type: Number,
    example: 503,
    default: 503,
    description: 'The HTTP status code for this error',
  })
  statusCode = 503;
  @ApiProperty({
    type: String,
    example: 'Service Unavailable',
    default: 'Service Unavailable',
  })
  message = 'Service Unavailable';
}
