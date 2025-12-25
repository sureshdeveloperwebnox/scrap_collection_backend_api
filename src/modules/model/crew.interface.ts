
import { Employee } from "@prisma/client";

export interface CreateCrewDto {
    name: string;
    description?: string;
    memberIds: string[];
    organizationId: number;
}

export interface UpdateCrewDto {
    name?: string;
    description?: string;
    memberIds?: string[];
    isActive?: boolean;
}

export interface CrewResponse {
    id: string;
    name: string;
    description?: string;
    organizationId: number;
    members: Employee[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
