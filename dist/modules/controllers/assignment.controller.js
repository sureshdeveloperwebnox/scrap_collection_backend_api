"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentController = void 0;
const assignment_service_1 = require("../services/assignment.service");
class AssignmentController {
    constructor() {
        this.assignmentService = new assignment_service_1.AssignmentService();
    }
    /**
     * POST /api/assignments/start
     * Start an assignment
     */
    async startAssignment(req, res) {
        try {
            const data = req.body;
            const result = await this.assignmentService.startAssignment(data);
            res.status(result.statusCode).json(result);
        }
        catch (error) {
            console.log("Error in startAssignment controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    /**
     * POST /api/assignments/complete
     * Complete an assignment
     */
    async completeAssignment(req, res) {
        try {
            const data = req.body;
            const result = await this.assignmentService.completeAssignment(data);
            res.status(result.statusCode).json(result);
        }
        catch (error) {
            console.log("Error in completeAssignment controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    /**
     * GET /api/assignments/:id
     * Get assignment by ID
     */
    async getAssignmentById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.assignmentService.getAssignmentById(id);
            res.status(result.statusCode).json(result);
        }
        catch (error) {
            console.log("Error in getAssignmentById controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    /**
     * GET /api/assignments/collector/:collectorId
     * Get all assignments for a collector
     */
    async getCollectorAssignments(req, res) {
        try {
            const { collectorId } = req.params;
            const status = req.query.status;
            const result = await this.assignmentService.getCollectorAssignments(collectorId, status);
            res.status(result.statusCode).json(result);
        }
        catch (error) {
            console.log("Error in getCollectorAssignments controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    /**
     * GET /api/assignments/crew/:crewId
     * Get all assignments for a crew
     */
    async getCrewAssignments(req, res) {
        try {
            const { crewId } = req.params;
            const status = req.query.status;
            const result = await this.assignmentService.getCrewAssignments(crewId, status);
            res.status(result.statusCode).json(result);
        }
        catch (error) {
            console.log("Error in getCrewAssignments controller", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
exports.AssignmentController = AssignmentController;
