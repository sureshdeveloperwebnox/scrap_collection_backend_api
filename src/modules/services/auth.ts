import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ApiResult } from '../../utils/api-result';
import { ISignUpData, ISignInData, UserRole } from '../model';
import { prisma } from '../../config';


export class Auth {
  public async signIn(data: ISignInData): Promise<ApiResult> {
    const { email, password } = data;

    // check Email
    const checkEmail = await prisma.user.findUnique({
      where: {
        email: email
      }
    });
    

    if (!checkEmail) {
      return ApiResult.error('Invalid email', 401);
    }
    const user = checkEmail;
    // Check password 
    const hashFromDB = String(user?.hashPassword).replace(/^\$2y\$/, '$2a$');
    const isMatch = await bcrypt.compare(password, hashFromDB);

    if (!isMatch) {
      return ApiResult.error('Invalid password', 401);
    }

    // Create JWT token with user category
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        role: user.role,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return ApiResult.success({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      },
      token
    }, 'Login successful');
  }

  public async signUp(data: ISignUpData): Promise<ApiResult> {
    const { name, firstName, lastName, phone, email, password, countryId, role = 'ADMIN' } = data;

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (userExists) {
      return ApiResult.error('User with this email already exists', 400);
    }


    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new organization
    const newOrganization = await prisma.organization.create({
      data: {
        name: name,
        email: email,
        phone: phone,
        isActive: true,
        countryId: countryId
      }
    });

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        organizationId: newOrganization.id,
        firstName: firstName,
        lastName: lastName,
        email: email,
        hashPassword: hashedPassword,
        phone: phone,
        role: role as UserRole
      }
    });

    // Create JWT token with user category
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const token = jwt.sign(
      { 
        id: newUser.id,
        email: email, 
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        role: role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return ApiResult.success({
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      },
      token
    }, 'User registered successfully', 201);
  }
}