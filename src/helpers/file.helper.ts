import fs from 'fs';
import path from 'path';

export const listFiles = (dirName: string): string[] =>
  fs
    .readdirSync(dirName, { withFileTypes: true })
    .flatMap((e) => {
      const filePath = path.join(dirName, e.name);
      //TODO: refatorar módulo para deixar a pasta interna generica
      if (e.isDirectory() && e.name.toLowerCase() != 'modules') {
        return listFiles(filePath);
      } else {
        return filePath;
      }
    })
    .filter((x) => x);

export const listFileByDecorators = (
  dirName: string,
  decoratorName: string[],
  extensionPrefix: string[],
): string[] =>
  fs
    .readdirSync(dirName, { withFileTypes: true })
    .flatMap((e) => {
      const filePath = path.join(dirName, e.name);
      if (e.isDirectory()) {
        return listFileByDecorators(filePath, decoratorName, extensionPrefix);
      }
      const result: string[] = [];
      if (!extensionPrefix.some((x) => filePath.endsWith(x))) {
        return;
      }
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (decoratorName.some((x) => fileContent.includes(x))) {
        result.push(filePath);
      }
      return result;
    })
    .filter((x) => x);

export const dtoExtensions = ['.dto.ts', '.dto.js'];
export const controllerExtensions = ['.controller.ts', '.controller.js'];
export const serviceExtensions = ['.service.ts', '.service.js'];
export const repositoryExtensions = ['.repository.ts', '.repository.js'];
export const profileExtensions = ['.profile.ts', '.profile.js'];
export const entityExtensions = ['.entity.ts', '.entity.js'];
export const recipeExtensions = [
  ...controllerExtensions,
  ...serviceExtensions,
  ...repositoryExtensions,
  ...profileExtensions,
];
export const crudExtensions = [...dtoExtensions, ...recipeExtensions];
export const allExtensions = [...crudExtensions, ...entityExtensions];
