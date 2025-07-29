import 'reflect-metadata';

export const CONTROLLER_METADATA = 'controller:metadata';

export function Controller(basePath: string): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, basePath, target);
    
    // Make sure we return the class constructor
    return target;
  };
}