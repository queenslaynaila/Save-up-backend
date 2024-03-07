import {Request, Response, Router} from "express";
import {z} from "zod";
import {sql} from "../../db";
import {savingInterface} from "./index";
import authMiddleware from "../../middleware/auth";
import {convertToTitleCase, isValidValue} from "../../middleware/caseNormalization";
import {HttpError} from "../../middleware/errorMiddleware";

const UUIDSCHEMA = z.string().uuid();
const ACCEPTED_STATUS_VALUES = ["In Progress", "Dormant", "Completed"];
const ACCEPTED_PRIORITY_VALUES = ["High", "Intermediate", "Low"];
const SQL_GET_SAVINGS =
  sql<Record<string, never>, savingInterface>(`
    SELECT *
    FROM savings
  `);

export default (router: Router) => {
  router.get<
  { savingsIdentifier: string },
  Record<string, never>,
  Array<boolean>,
  { status: string; category_id?: string; priority?: string }
  >(
    "/:savingsIdentifier",
    authMiddleware(),
    async (req: Request, res: Response) => {
      const {savingsIdentifier} = req.params;
      const {category_id, priority, status} = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};

      const convertedStatus = status ? convertToTitleCase(status) : undefined;
      const convertedPriority = priority ? convertToTitleCase(priority) : undefined;
      const isStandardUser = req.user?.role === "User";

      if (savingsIdentifier === "me") {
        queryParams.user_id = req.user!.id;
        filters.push(`user_id = '${queryParams.user_id}'`);
      } else if (savingsIdentifier === "all") {
        if (isStandardUser) {
          throw new HttpError(401, "Unauthorized");
        }
      } else if (UUIDSCHEMA.parse(savingsIdentifier)) {
        if (isStandardUser) {
          throw new HttpError(401, "Unauthorized");
        }
        queryParams.user_id = savingsIdentifier;
        filters.push(`user_id = '${savingsIdentifier}'`);
      } else {
        throw new HttpError(400, "Bad request");
      }

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }

      if (convertedPriority && isValidValue(convertedPriority, ACCEPTED_PRIORITY_VALUES)) {
        filterArgs.priority = convertedPriority;
        filters.push(`priority = :priority`);
      }

      if (convertedStatus && isValidValue(convertedStatus, ACCEPTED_STATUS_VALUES)) {
        filterArgs.status = convertedStatus;
        filters.push(`status = :status`);
      }

      const query = SQL_GET_SAVINGS({});
      if (filters.length > 0)
        query.extend(`WHERE ${filters.join(" AND ")}`, filterArgs);
      query.extend("LIMIT 15", {});

      res.json(await query.many());
    });
};
