export const ClassName = (className: string) => (target: any) => {
  Object.defineProperty(target, 'name', { value: className });
};
