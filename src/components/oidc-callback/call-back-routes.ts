import * as express from "express";
import { oidcAuthCallbackGet } from "./call-back-controller";
import { PATH_DATA } from "../../app.constants";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(PATH_DATA.AUTH_CALLBACK.url, asyncHandler(oidcAuthCallbackGet()));

export { router as oidcAuthCallbackRouter };
