import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { validateStartAssignment, validateCompleteAssignment } from '../rules/assignment.rules';
import { mobileAuthMiddleware } from '../../middlewares/mobile-auth.middleware';

const router = Router();
const assignmentController = new AssignmentController();

/**
 * @route   POST /api/v1/assignments/start
 * @desc    Start an assignment
 * @access  Private (Requires JWT token)
 */
router.post(
    '/start',
    mobileAuthMiddleware as any,
    validateStartAssignment,
    assignmentController.startAssignment.bind(assignmentController)
);

/**
 * @route   POST /api/v1/assignments/complete
 * @desc    Complete an assignment
 * @access  Private (Requires JWT token)
 */
router.post(
    '/complete',
    mobileAuthMiddleware as any,
    validateCompleteAssignment,
    assignmentController.completeAssignment.bind(assignmentController)
);

/**
 * @route   GET /api/v1/assignments/:id
 * @desc    Get assignment by ID
 * @access  Private (Requires JWT token)
 */
router.get(
    '/:id',
    mobileAuthMiddleware as any,
    assignmentController.getAssignmentById.bind(assignmentController)
);

/**
 * @route   GET /api/v1/assignments/collector/:collectorId
 * @desc    Get all assignments for a collector
 * @access  Private (Requires JWT token)
 */
router.get(
    '/collector/:collectorId',
    mobileAuthMiddleware as any,
    assignmentController.getCollectorAssignments.bind(assignmentController)
);

/**
 * @route   GET /api/v1/assignments/crew/:crewId
 * @desc    Get all assignments for a crew
 * @access  Private (Requires JWT token)
 */
router.get(
    '/crew/:crewId',
    mobileAuthMiddleware as any,
    assignmentController.getCrewAssignments.bind(assignmentController)
);

export default router;
