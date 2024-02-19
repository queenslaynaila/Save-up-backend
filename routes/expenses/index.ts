import {Router} from "express";
import getExpenseById from "./getExpenseById";

export default (baseRouter: Router) => {
  const router = new Router();
  getExpenseById(router);

  baseRouter.use("/expenses", router);
}
