import request from "supertest";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { PATH_DATA } from "../../../app.constants";
import { JWT } from "jose";
import CF_CONFIG from "../../../config/cf";

describe("Integration:: delete account", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;
  const idToken = "Idtoken";

  before(() => {
    decache("../../../app");
    decache("../../../middleware/requires-auth-middleware");
    const sessionMiddleware = require("../../../middleware/requires-auth-middleware");
    sandbox = sinon.createSandbox();
    sandbox
      .stub(sessionMiddleware, "requiresAuthMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        req.session.user = {
          email: "test@test.com",
          phoneNumber: "07839490040",
          isAuthenticated: true,
          state: {
            deleteAccount: {
              value: "CHANGE_VALUE",
              events: ["VALUE_UPDATED", "VERIFY_CODE_SENT"],
            },
          },
          tokens: {
            accessToken: JWT.sign(
              { sub: "12345", exp: "1758477938" },
              "secret"
            ),
            idToken: idToken,
            refreshToken: "token",
          },
        };
        next();
      });

    app = require("../../../app").createApp();
    baseApi = process.env.AM_API_BASE_URL;

    request(app)
      .get(PATH_DATA.DELETE_ACCOUNT.url)
      .end((err, res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sandbox.restore();
    app = undefined;
  });

  it("should return delete account page", (done) => {
    request(app).get(PATH_DATA.DELETE_ACCOUNT.url).expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_DATA.DELETE_ACCOUNT.url)
      .type("form")
      .expect(500, done);
  });

  it("should redirect to end session endpoint", (done) => {
    nock(baseApi).post(PATH_DATA.DELETE_ACCOUNT.url).once().reply(200, {});

    const opApi = process.env.API_BASE_URL;

    request(app)
      .post(PATH_DATA.DELETE_ACCOUNT.url)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(
        "Location",
        `${opApi}/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(
          CF_CONFIG.url + PATH_DATA.ACCOUNT_DELETED_CONFIRMATION.url
        )}`
      )
      .expect(302, done);
  });
});