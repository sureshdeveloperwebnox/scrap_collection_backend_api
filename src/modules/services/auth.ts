import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
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

  public async signInWithGoogle(idToken: string): Promise<ApiResult> {
    try {
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

      if (!GOOGLE_CLIENT_ID) {
        return ApiResult.error('Google OAuth not configured', 500);
      }

      const client = new OAuth2Client(GOOGLE_CLIENT_ID);

      // Verify the ID token
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return ApiResult.error('Invalid Google token', 401);
      }

      const { email, given_name, family_name, picture, sub } = payload;

      if (!email) {
        return ApiResult.error('Email not provided by Google', 400);
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email },
        include: { organization: true }
      });

      if (!user) {
        // Create new user and organization
        const fullName = `${given_name || ''} ${family_name || ''}`.trim() || email.split('@')[0];

        // Get the first active country, or create a default one if none exists
        let country = await prisma.country.findFirst({
          where: { isActive: true },
          orderBy: { id: 'asc' }
        });

        if (!country) {
          // Create a default country if none exists
          country = await prisma.country.create({
            data: {
              name: 'Default',
              currency: 'USD',
              isActive: true
            }
          });
        }

        // Create new organization
        const newOrganization = await prisma.organization.create({
          data: {
            name: fullName,
            email: email,
            phone: '',
            isActive: true,
            countryId: country.id
          }
        });

        // Create new user
        user = await prisma.user.create({
          data: {
            organizationId: newOrganization.id,
            firstName: given_name || fullName,
            lastName: family_name || '',
            email: email,
            hashPassword: '', // No password for Google OAuth users
            phone: '',
            role: UserRole.ADMIN
          },
          include: { organization: true }
        });
      }

      // Create JWT token
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
      }, 'Google sign-in successful');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return ApiResult.error(
        error.message || 'Google authentication failed',
        401
      );
    }
  }

  public async signOut(): Promise<ApiResult> {
    // For JWT tokens, signout is typically handled client-side by removing the token
    // This endpoint exists for consistency and can be extended to handle token blacklisting if needed
    return ApiResult.success(null, 'Signed out successfully');
  }
}