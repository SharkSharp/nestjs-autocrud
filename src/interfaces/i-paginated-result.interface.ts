export interface IPaginatedResult<Entity> {
  data: Entity[];
  count: number;
}
