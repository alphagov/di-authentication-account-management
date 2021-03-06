import { NextFunction, Request, Response } from "express";
import {
  getAnalyticsCookieDomain,
  getAuthFrontEndUrl,
  getGtmId,
  getYourAccountUrl,
} from "../config";
import { generateNonce } from "../utils/strings";
import xss from "xss";

export function setLocalVarsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.gtmId = getGtmId();
  res.locals.scriptNonce = generateNonce();
  res.locals.authFrontEndUrl = getAuthFrontEndUrl();
  res.locals.analyticsCookieDomain = getAnalyticsCookieDomain();
  res.locals.govAccountsUrl = getYourAccountUrl();

  if (req.cookies && req.cookies.gs) {
    const ids = xss(req.cookies["gs"]).split(".");
    res.locals.sessionId = ids[0];
    res.locals.clientSessionId = ids[1];
  }
  if (req.cookies && req.cookies["di-persistent-session-id"]) {
    res.locals.persistentSessionId = xss(
      req.cookies["di-persistent-session-id"]
    );
  }
  next();
}
