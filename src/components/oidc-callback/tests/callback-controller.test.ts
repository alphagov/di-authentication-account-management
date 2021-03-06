import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { oidcAuthCallbackGet } from "../call-back-controller";
import { PATH_DATA, VECTORS_OF_TRUST } from "../../../app.constants";
import { ClientAssertionServiceInterface } from "../../../utils/types";

describe("callback controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      query: {},
      session: { user: {}, destroy: sandbox.fake() },
      t: sandbox.fake(),
      oidc: {
        callbackParams: sandbox.fake(),
        callback: sandbox.fake.returns({
          accessToken: "accessToken",
          idToken: "idtoken",
          claims: () => {
            return { vot: VECTORS_OF_TRUST.MEDIUM };
          },
        }),
        userinfo: sandbox.fake.returns({
          email: "ad@ad.com",
          phoneNumber: "12345678999",
        }),
        metadata: { redirect_uris: [] },
        issuer: {
          metadata: {},
        },
      },
    };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake(),
      cookie: sandbox.fake(),
      locals: {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("oidcAuthCallbackGet", () => {
    it("should redirect to /manage-your-account", async () => {
      const fakeService: ClientAssertionServiceInterface = {
        generateAssertionJwt: sandbox.fake.returns("testassert"),
      };

      await oidcAuthCallbackGet(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        PATH_DATA.MANAGE_YOUR_ACCOUNT.url
      );
    });

    it("should redirect to /manage-your-account and set cookie when consent query param present", async () => {
      req.query.cookie_consent = "accept";

      const fakeService: ClientAssertionServiceInterface = {
        generateAssertionJwt: sandbox.fake.returns("testassert"),
      };

      await oidcAuthCallbackGet(fakeService)(req as Request, res as Response);

      expect(res.cookie).to.have.calledOnce;
      expect(res.redirect).to.have.calledWith(
        PATH_DATA.MANAGE_YOUR_ACCOUNT.url
      );
    });

    it("should redirect to /manage-your-account and have _ga as query param when cookie consent accepted", async () => {
      req.query.cookie_consent = "accept";
      req.query._ga = "2.172053219.3232.1636392870-444224.1635165988";

      const fakeService: ClientAssertionServiceInterface = {
        generateAssertionJwt: sandbox.fake.returns("testassert"),
      };

      await oidcAuthCallbackGet(fakeService)(req as Request, res as Response);

      expect(res.cookie).to.have.calledOnce;
      expect(res.redirect).to.have.calledWith(
        PATH_DATA.MANAGE_YOUR_ACCOUNT.url +
          "?_ga=2.172053219.3232.1636392870-444224.1635165988"
      );
    });

    it("should redirect to /start when not medium level auth", async () => {
      req.oidc.callback = sandbox.fake.returns({
        accessToken: "accessToken",
        idToken: "idtoken",
        claims: () => {
          return { vot: VECTORS_OF_TRUST.LOW };
        },
      });
      const fakeService: ClientAssertionServiceInterface = {
        generateAssertionJwt: sandbox.fake.returns("testassert"),
      };

      await oidcAuthCallbackGet(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_DATA.START.url);
    });
  });
});
