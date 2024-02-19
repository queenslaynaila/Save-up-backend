import express, {NextFunction, Request, Response} from "express";
import * as usersController from "../controllers/usersController";
import authMiddleware from "../middleware/auth";
import "express-async-errors";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.getAllUsers(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.getUserById(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.updateUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.deleteUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.createUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/signin", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/signout", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.signout(req, res);
  } catch (error) {
    next(error);
  }
});


export default router;
