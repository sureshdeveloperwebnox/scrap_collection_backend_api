import { AssignmentStatus } from "./enum";

export interface IStartAssignmentRequest {
    orderId: string;
    assignOrderId: string;
    collectorId?: string;
    crewId?: string;
    timeStamp?: Date | string;
}

export interface ICompleteAssignmentRequest {
    orderId: string;
    assignOrderId: string;
    collectorId?: string;
    crewId?: string;
    completionNotes?: string;
    completionPhotos?: string[];
    timeStamp?: Date | string;
}

export interface IAssignmentStatusUpdate {
    assignOrderId: string;
    status: AssignmentStatus;
    timestamp: Date;
    notes?: string;
    photos?: string[];
}
