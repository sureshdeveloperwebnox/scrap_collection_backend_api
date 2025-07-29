// src/decorators/authenticate.decorator.ts
import 'reflect-metadata';
import { UserCategory } from '../utils/user-category.enum';

export const AUTHENTICATE_METADATA = 'authenticate:metadata';

export function Authenticate(allowedCategories: UserCategory[]): MethodDecorator {
    return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
        console.log(`Setting auth metadata for ${String(key)} with categories:`, allowedCategories);
        Reflect.defineMetadata(AUTHENTICATE_METADATA, allowedCategories, descriptor.value);
        return descriptor;
    };
}