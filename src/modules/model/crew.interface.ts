
import { Employee } from "@prisma/client";

export interface CreateCrewDto {
    name: string;
    description?: string;
    memberIds: string[];
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
    members: Employee[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
