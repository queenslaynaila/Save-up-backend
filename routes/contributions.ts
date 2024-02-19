import express, {NextFunction, Request, Response} from "express";
import * as contributionsController from "../controllers/contributionsController";
import authMiddleware from "../middleware/auth";

const router = express.Router();

router.get("/", contributionsController.getAllContributions);

router.get("/:id", authMiddleware, contributionsController.getContributionsById);

router.patch("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.updateContributions(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.deleteContributions(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.createContributions(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/saving/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.getContributionsBySaving(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
