import {
  createDtoFor,
  paginatedResultDtoFor,
  updateDtoFor,
} from '@Helpers/dto.helper';
import { IDtoRecipe } from '@Interfaces/i-dto-recipe.interface';
import { Type } from '@nestjs/common';

export class DtoRecipe implements IDtoRecipe {
  constructor(private readonly target: Type<any>) {}

  private _createDto: Type<any>;
  private _updateDto: Type<any>;
  private _returnDto: Type<any>;
  private _paginatedResultDto: Type<any>;

  get createDto(): Type<any> {
    return this._createDto ?? (this._createDto = createDtoFor(this.target));
  }
  set createDto(value: Type<any>) {
    this._createDto = value;
  }

  get updateDto(): Type<any> {
    return this._updateDto ?? (this._updateDto = updateDtoFor(this.target));
  }
  set updateDto(value: Type<any>) {
    this._updateDto = value;
  }

  get returnDto(): Type<any> {
    return this._returnDto ?? this.target;
  }
  set returnDto(value: Type<any>) {
    this._returnDto = value;
  }

  get paginatedResultDto(): Type<any> {
    return (
      this._paginatedResultDto ??
      (this._paginatedResultDto = paginatedResultDtoFor(this.target))
    );
  }
  set paginatedResultDto(value: Type<any>) {
    this._paginatedResultDto = value;
  }
}
