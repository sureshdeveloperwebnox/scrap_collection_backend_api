import 'reflect-metadata';

export const MIDDLEWARE_METADATA = 'middleware:metadata';
export const VALIDATE_METADATA = 'validate:metadata';

export function Middleware(middleware: any): MethodDecorator {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    const middlewares = Reflect.getMetadata(MIDDLEWARE_METADATA, descriptor.value) || [];
    Reflect.defineMetadata(MIDDLEWARE_METADATA, [...middlewares, middleware], descriptor.value);
    return descriptor;
  };
}

export function Validate(rules: any[]): MethodDecorator {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(VALIDATE_METADATA, rules, descriptor.value);
    return descriptor;
  };
}