import { NextFunction, Request, Response } from "express";
import {
  getAnalyticsCookieDomain,
  getAuthFrontEndUrl,
  getCookiesAndFeedbackLink,
  getGtmId,
  getYourAccountUrl,
} from "../config";
import { generateNonce } from "../utils/strings";
import * as querystring from "querystring";

export function setLocalVarsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.gtmId = getGtmId();
  res.locals.scriptNonce = generateNonce();
  res.locals.authFrontEndUrl = getAuthFrontEndUrl();
  res.locals.analyticsCookieDomain = getAnalyticsCookieDomain();
  res.locals.cookiesAndFeedbackUrl = getCookiesAndFeedbackLink();
  res.locals.govAccountsUrl = formatYourAccountUrl(req, getYourAccountUrl());
  next();
}

function formatYourAccountUrl(req: Request, accountUrl: string) {
  const cookieConsent = req.cookies.cookies_preferences_set;
  if (cookieConsent) {
    const parsedCookie = JSON.parse(cookieConsent);
    return parsedCookie.gaId
      ? accountUrl + "?" + querystring.stringify({ _ga: parsedCookie.gaId })
      : accountUrl;
  }
  return accountUrl;
}
