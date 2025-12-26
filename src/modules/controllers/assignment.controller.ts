import { Request, Response } from 'express';
import { AssignmentService } from '../services/assignment.service';
import { IStartAssignmentRequest, ICompleteAssignmentRequest } from '../model/assignment.interface';
import { AssignmentStatus } from '../model/enum';

export class AssignmentController {
    private assignmentService: AssignmentService;

    constructor() {
        this.assignmentService = new AssignmentService();
    }

    /**
     * POST /api/assignments/start
     * Start an assignment
     */
    public async startAssignment(req: Request, res: Response): Promise<void> {
        try {
            const data: IStartAssignmentRequest = req.body;
            const result = await this.assignmentService.startAssignment(data);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.log("Error in startAssignment controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    /**
     * POST /api/assignments/complete
     * Complete an assignment
     */
    public async completeAssignment(req: Request, res: Response): Promise<void> {
        try {
            const data: ICompleteAssignmentRequest = req.body;
            const result = await this.assignmentService.completeAssignment(data);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.log("Error in completeAssignment controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    /**
     * GET /api/assignments/:id
     * Get assignment by ID
     */
    public async getAssignmentById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this.assignmentService.getAssignmentById(id);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.log("Error in getAssignmentById controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    /**
     * GET /api/assignments/collector/:collectorId
     * Get all assignments for a collector
     */
    public async getCollectorAssignments(req: Request, res: Response): Promise<void> {
        try {
            const { collectorId } = req.params;
            const status = req.query.status as AssignmentStatus | undefined;
            const result = await this.assignmentService.getCollectorAssignments(collectorId, status);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.log("Error in getCollectorAssignments controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    /**
     * GET /api/assignments/crew/:crewId
     * Get all assignments for a crew
     */
    public async getCrewAssignments(req: Request, res: Response): Promise<void> {
        try {
            const { crewId } = req.params;
            const status = req.query.status as AssignmentStatus | undefined;
            const result = await this.assignmentService.getCrewAssignments(crewId, status);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.log("Error in getCrewAssignments controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
