import { Router } from "express";
import { ApplicationController } from "../controllers/ApplicationController";
import { authenticateToken, requireUserType } from "../middleware/auth";

const router = Router();
const applicationController = new ApplicationController();

// PA Part C: Candidate application endpoints
router.post(
    "/",
    authenticateToken,
    requireUserType(["candidate"]),
    applicationController.createApplication.bind(applicationController)
);

router.get(
    "/my-applications",
    authenticateToken,
    requireUserType(["candidate"]),
    applicationController.getMyCandidateApplications.bind(applicationController)
);

router.get(
    "/courses-and-roles",
    authenticateToken,
    requireUserType(["candidate"]),
    applicationController.getCoursesAndRoles.bind(applicationController)
);

// CR & DI Parts: Lecturer application endpoints
router.get(
    "/lecturer",
    authenticateToken,
    requireUserType(["lecturer"]),
    applicationController.getApplicationsForLecturer.bind(applicationController)
);

router.get(
    "/statistics",
    authenticateToken,
    requireUserType(["lecturer"]),
    applicationController.getApplicationStatistics.bind(applicationController)
);

router.put(
    "/:id/status",
    authenticateToken,
    requireUserType(["lecturer"]),
    applicationController.updateApplicationStatus.bind(applicationController)
);

export default router; 