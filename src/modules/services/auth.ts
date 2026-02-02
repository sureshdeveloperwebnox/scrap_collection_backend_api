import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { ApiResult } from '../../utils/api-result';
import { ISignUpData, ISignInData, UserRole } from '../model';
import { prisma } from '../../config';

interface TokenPayload {
  id: string;
  email: string;
  firstName: string;
  role: string;
  organizationId?: number;
}

export class Auth {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key';
  private readonly ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
  private readonly REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived refresh token

  private generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY
    });

    return { accessToken, refreshToken };
  }
  public async signIn(data: ISignInData): Promise<ApiResult> {
    const emailStr = typeof data?.email === 'string' ? data.email.trim() : '';
    const password = data?.password;

    if (!emailStr) {
      return ApiResult.error('Email is required', 400);
    }
    if (!password || typeof password !== 'string') {
      return ApiResult.error('Password is required', 400);
    }

    let checkEmail;
    try {
      checkEmail = await prisma.users.findUnique({
        where: { email: emailStr },
      });
    } catch (err: any) {
      console.error('SignIn findUnique error:', err?.message ?? err);
      return ApiResult.error('Invalid email or password', 401);
    }

    if (!checkEmail) {
      return ApiResult.error('Invalid email or password', 401);
    }
    const user = checkEmail;
    const hashFromDB = user?.hashPassword
      ? String(user.hashPassword).replace(/^\$2y\$/, '$2a$')
      : '';
    if (!hashFromDB) {
      return ApiResult.error('Invalid email or password', 401);
    }
    const isMatch = await bcrypt.compare(password, hashFromDB);

    if (!isMatch) {
      return ApiResult.error('Invalid password', 401);
    }

    // Create JWT tokens
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      role: user.role,
      organizationId: user.organizationId || undefined
    };

    const { accessToken, refreshToken } = this.generateTokens(tokenPayload);

    return ApiResult.success({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profileImg: user.profileImg,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      },
      accessToken,
      refreshToken
    }, 'Login successful');
  }

  public async signUp(data: ISignUpData): Promise<ApiResult> {
    const emailStr = typeof data?.email === 'string' ? data.email.trim() : '';
    if (!emailStr) {
      return ApiResult.error('Email is required', 400);
    }

    let userExists;
    try {
      userExists = await prisma.users.findUnique({
        where: { email: emailStr },
      });
    } catch (err: any) {
      console.error('SignUp findUnique error:', err?.message ?? err);
      return ApiResult.error('Registration failed. Please try again.', 500);
    }

    if (userExists) {
      return ApiResult.error('User with this email already exists', 400);
    }

    const name = typeof data?.name === 'string' ? data.name.trim() : '';
    const phoneStr = data?.phone != null ? String(data.phone).trim() : '';
    const password = data?.password;
    if (!name) return ApiResult.error('Name is required', 400);
    if (!password || typeof password !== 'string') return ApiResult.error('Password is required', 400);

    const countryId = typeof data?.countryId === 'number' && data.countryId > 0 ? data.countryId : undefined;
    const firstName = data?.firstName;
    const lastName = data?.lastName;
    const role = data?.role ?? 'ADMIN';

    let newOrganization;
    let newUser;

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      newOrganization = await prisma.organization.create({
        data: {
          name,
          email: emailStr,
          phone: phoneStr || undefined,
          isActive: true,
          ...(countryId != null && { countryId }),
        },
      });

      newUser = await prisma.users.create({
        data: {
          organizationId: newOrganization.id,
          firstName: firstName ?? name.split(' ')[0] ?? name,
          lastName: lastName ?? name.split(' ').slice(1).join(' ') ?? '',
          email: emailStr,
          hashPassword: hashedPassword,
          phone: phoneStr || undefined,
          role: role as UserRole,
        },
      });
    } catch (err: any) {
      console.error('SignUp create error:', err?.message ?? err);
      return ApiResult.error(
        err?.code === 'P2003'
          ? 'Invalid reference (e.g. country). Please check your details.'
          : 'Registration failed. Please check your details and try again.',
        400
      );
    }

    const tokenPayload: TokenPayload = {
      id: newUser.id,
      email: emailStr,
      firstName: newUser.firstName ?? '',
      role: newUser.role,
      organizationId: newOrganization.id,
    };

    const { accessToken, refreshToken } = this.generateTokens(tokenPayload);

    return ApiResult.success(
      {
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          profileImg: newUser.profileImg,
          role: newUser.role,
          organizationId: newOrganization.id,
        },
        accessToken,
        refreshToken,
      },
      'User registered successfully',
      201
    );
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
      let user = await prisma.users.findUnique({
        where: { email },
        include: { Organization: true }
      });

      if (!user) {
        // Create new user WITHOUT organization - they will set it up later
        const fullName = `${given_name || ''} ${family_name || ''}`.trim() || email.split('@')[0];

        // Create new user without organization
        const createdUser = await prisma.users.create({
          data: {
            organizationId: null, // No organization yet
            firstName: given_name || fullName,
            lastName: family_name || '',
            email: email,
            hashPassword: '', // No password for Google OAuth users
            phone: '',
            role: UserRole.ADMIN,
            profileImg: picture || null
          }
        });

        // Fetch user (without organization)
        user = await prisma.users.findUnique({
          where: { id: createdUser.id },
          include: { Organization: true }
        }) as any;

        if (!user) {
          return ApiResult.error('Failed to create user', 500);
        }
      }

      if (!user) {
        return ApiResult.error('User not found', 404);
      }

      // Create JWT tokens
      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        role: user.role,
        organizationId: user.organizationId || undefined
      };

      const { accessToken, refreshToken } = this.generateTokens(tokenPayload);

      return ApiResult.success({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          profileImg: user.profileImg,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId
        },
        accessToken,
        refreshToken
      }, 'Google sign-in successful');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return ApiResult.error(
        error.message || 'Google authentication failed',
        401
      );
    }
  }

  public async refreshToken(refreshToken: string): Promise<ApiResult> {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload;

      // Generate new tokens
      const tokenPayload: TokenPayload = {
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        role: decoded.role,
        organizationId: decoded.organizationId
      };

      const tokens = this.generateTokens(tokenPayload);

      return ApiResult.success({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }, 'Token refreshed successfully');
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return ApiResult.error('Invalid or expired refresh token', 401);
    }
  }

  public async getMe(userId: string): Promise<ApiResult> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          profileImg: true,
          role: true,
          organizationId: true,
        }
      });

      if (!user) {
        return ApiResult.error('User not found', 404);
      }

      return ApiResult.success({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          profileImg: user.profileImg,
          role: user.role,
          organizationId: user.organizationId
        }
      }, 'User retrieved successfully');
    } catch (error: any) {
      console.error('Get me error:', error);
      return ApiResult.error('Failed to retrieve user', 500);
    }
  }

  public async updateProfile(userId: string, data: { fullName?: string, firstName?: string, lastName?: string, phone?: string, email?: string, profileImg?: string }): Promise<ApiResult> {
    try {
      // Check if user exists
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return ApiResult.error('User not found', 404);
      }

      // Handle fullName split if provided
      let firstName = data.firstName;
      let lastName = data.lastName;

      if (data.fullName) {
        const parts = data.fullName.trim().split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }

      // Check if email is being updated and if it's already taken
      if (data.email && data.email !== user.email) {
        const emailExists = await prisma.users.findUnique({
          where: { email: data.email }
        });

        if (emailExists) {
          return ApiResult.error('Email already in use', 400);
        }
      }

      // Update user
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          firstName: firstName !== undefined ? firstName : user.firstName,
          lastName: lastName !== undefined ? lastName : user.lastName,
          phone: data.phone !== undefined ? data.phone : user.phone,
          email: data.email || user.email,
          profileImg: data.profileImg !== undefined ? data.profileImg : user.profileImg,
        }
      });

      return ApiResult.success({
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profileImg: updatedUser.profileImg,
          role: updatedUser.role,
          organizationId: updatedUser.organizationId
        }
      }, 'Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      return ApiResult.error('Failed to update profile', 500);
    }
  }

  public async signOut(): Promise<ApiResult> {
    // For JWT tokens, signout is typically handled client-side by removing the token
    // This endpoint exists for consistency and can be extended to handle token blacklisting if needed
    return ApiResult.success(null, 'Signed out successfully');
  }
}