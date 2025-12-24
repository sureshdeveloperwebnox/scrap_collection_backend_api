// Mobile Authentication Models

export interface IMobileLoginData {
    identifier: string; // Can be email or phone
    password: string;
}

export interface IMobileTokenPayload {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    role: string;
    roleId: number;
    organizationId: number;
    scrapYardId?: string;
    crewId?: string;
    type: 'access' | 'refresh';
}

export interface IMobileLoginResponse {
    collector: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role: {
            id: number;
            name: string;
        };
        profilePhoto?: string;
        rating?: number;
        completedPickups: number;
        scrapYard?: {
            id: string;
            yardName: string;
        };
        crew?: {
            id: string;
            name: string;
        };
    };
    accessToken: string;
    refreshToken: string;
}

export interface IRefreshTokenData {
    refreshToken: string;
}
