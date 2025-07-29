import 'reflect-metadata';

export const METHOD_METADATA = 'method:metadata';
export const PATH_METADATA = 'path:metadata';

export enum RequestMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
}

const createMappingDecorator = (method: RequestMethod) => {
  return (path: string): MethodDecorator => {
    return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
      Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
      Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value);
      return descriptor;
    };
  };
};

export const GET = createMappingDecorator(RequestMethod.GET);
export const POST = createMappingDecorator(RequestMethod.POST);
export const PUT = createMappingDecorator(RequestMethod.PUT);
export const DELETE = createMappingDecorator(RequestMethod.DELETE);
export const PATCH = createMappingDecorator(RequestMethod.PATCH);