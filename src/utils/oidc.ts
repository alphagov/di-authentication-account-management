import { Issuer, Client, custom, generators } from "openid-client";
import { OIDCConfig } from "../types";
import pMemoize = require("p-memoize");
import { ClientAssertionServiceInterface, KmsService } from "./types";
import { kmsService } from "./kms";
import base64url from "base64url";
import random = generators.random;
import { decodeJwt, createRemoteJWKSet } from "jose";

custom.setHttpOptionsDefaults({
  timeout: 10000,
});

async function getIssuer(discoveryUri: string) {
  return await Issuer.discover(discoveryUri);
}

const cachedIssuer = pMemoize(getIssuer, { maxAge: 43200000 });

async function getOIDCClient(config: OIDCConfig): Promise<Client> {
  const issuer = await cachedIssuer(config.idp_url);

  return new issuer.Client({
    client_id: config.client_id,
    redirect_uris: [config.callback_url],
    response_types: ["code"],
    token_endpoint_auth_method: "none", //allows for a custom client_assertion
    id_token_signed_response_alg: "ES256",
    scopes: config.scopes,
  });
}

async function getJWKS(config: OIDCConfig) {
  const issuer = await cachedIssuer(config.idp_url);

  return createRemoteJWKSet(new URL(issuer.metadata.jwks_uri));
}

const cached = pMemoize(getOIDCClient, { maxAge: 43200000 });

const cachedJwks = pMemoize(getJWKS, { maxAge: 43200000 });

function isTokenExpired(token: string): boolean {
  const decodedToken = decodeJwt(token);

  const next60Seconds = new Date();
  next60Seconds.setSeconds(60);

  return (decodedToken.exp as number) < next60Seconds.getTime() / 1000;
}

function clientAssertionGenerator(
  kms: KmsService = kmsService()
): ClientAssertionServiceInterface {
  const generateAssertionJwt = async function (
    clientId: string,
    tokenEndpointUri: string
  ): Promise<string> {
    const headers = {
      alg: "RS512",
      typ: "JWT",
    };

    const payload = {
      iss: clientId,
      sub: clientId,
      aud: tokenEndpointUri,
      exp: Math.floor((new Date().getTime() + 5 * 60000) / 1000),
      iat: Math.floor(new Date().getTime() / 1000),
      jti: random(),
    };

    const token_components = {
      header: base64url.encode(JSON.stringify(headers)),
      payload: base64url.encode(JSON.stringify(payload)),
    };

    const message = Buffer.from(
      token_components.header + "." + token_components.payload
    ).toString();

    const sig = await kms.sign(message);

    return (
      token_components.header +
      "." +
      token_components.payload +
      "." +
      sig.Signature.toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
    );
  };

  return {
    generateAssertionJwt,
  };
}

export {
  cached as getOIDCClient,
  cachedJwks as getJWKS,
  isTokenExpired,
  clientAssertionGenerator,
};
