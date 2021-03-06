import { PATH_DATA } from "../../app.constants";

import express from "express";
import { signedOutGet } from "./signed-out-controller";

const router = express.Router();

router.get(PATH_DATA.USER_SIGNED_OUT.url, signedOutGet);

export { router as signedOutRouter };
