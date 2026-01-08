"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = require("../controllers/assignment.controller");
const assignment_rules_1 = require("../rules/assignment.rules");
const mobile_auth_middleware_1 = require("../../middlewares/mobile-auth.middleware");
const router = (0, express_1.Router)();
const assignmentController = new assignment_controller_1.AssignmentController();
/**
 * @route   POST /api/v1/assignments/start
 * @desc    Start an assignment
 * @access  Private (Requires JWT token)
 */
router.post('/start', mobile_auth_middleware_1.mobileAuthMiddleware, assignment_rules_1.validateStartAssignment, assignmentController.startAssignment.bind(assignmentController));
/**
 * @route   POST /api/v1/assignments/complete
 * @desc    Complete an assignment
 * @access  Private (Requires JWT token)
 */
router.post('/complete', mobile_auth_middleware_1.mobileAuthMiddleware, assignment_rules_1.validateCompleteAssignment, assignmentController.completeAssignment.bind(assignmentController));
/**
 * @route   GET /api/v1/assignments/:id
 * @desc    Get assignment by ID
 * @access  Private (Requires JWT token)
 */
router.get('/:id', mobile_auth_middleware_1.mobileAuthMiddleware, assignmentController.getAssignmentById.bind(assignmentController));
/**
 * @route   GET /api/v1/assignments/collector/:collectorId
 * @desc    Get all assignments for a collector
 * @access  Private (Requires JWT token)
 */
router.get('/collector/:collectorId', mobile_auth_middleware_1.mobileAuthMiddleware, assignmentController.getCollectorAssignments.bind(assignmentController));
/**
 * @route   GET /api/v1/assignments/crew/:crewId
 * @desc    Get all assignments for a crew
 * @access  Private (Requires JWT token)
 */
router.get('/crew/:crewId', mobile_auth_middleware_1.mobileAuthMiddleware, assignmentController.getCrewAssignments.bind(assignmentController));
exports.default = router;
