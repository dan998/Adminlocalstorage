// =====================================================
// SESSION TOKEN
// SessionToken.gs
// Registration System API
// =====================================================


// =====================================================
// SESSION TOKEN CONFIGURATION
// =====================================================

const SESSION_TOKEN_CONFIG = {

  // Random bytes used to generate a token.
  // 32 bytes = 256 bits of entropy.
  TOKEN_BYTES: 32,

  // Expected hexadecimal token length.
  TOKEN_LENGTH: 64,

  // SHA-256 hash length.
  HASH_LENGTH: 64,

  // Token prefix used for identification.
  TOKEN_PREFIX: "sess_",

  // Maximum token length accepted.
  MAX_TOKEN_LENGTH: 256

};


// =====================================================
// GENERATE SESSION TOKEN
// =====================================================

function generateSessionToken() {

  const randomBytes =
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ""
      ) +
      Utilities
        .getUuid()
        .replace(
          /-/g,
          ""
        );


  const timestamp =
    String(
      Date.now()
    );


  const raw =
    randomBytes +
    timestamp +
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ""
      );


  const digest =
    Utilities
      .computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        raw,
        Utilities.Charset.UTF_8
      );


  let token =
    digest
      .map(
        function(byte) {

          const value =
            byte < 0
              ? byte + 256
              : byte;

          return (
            value
              .toString(16)
              .padStart(
                2,
                "0"
              )
          );

        }
      )
      .join("");


  token =
    SESSION_TOKEN_CONFIG.TOKEN_PREFIX +
    token;


  return token;

}


// =====================================================
// GENERATE RAW TOKEN
// =====================================================

function generateRawSessionToken() {

  const bytes =
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ""
      ) +
      Utilities
        .getUuid()
        .replace(
          /-/g,
          ""
        );


  return (
    SESSION_TOKEN_CONFIG.TOKEN_PREFIX +
    bytes
  );

}


// =====================================================
// HASH SESSION TOKEN
// =====================================================

function hashSessionToken(
  token
) {

  if (!token) {

    throw new Error(
      "Session token is required"
    );

  }


  const digest =
    Utilities
      .computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        String(token),
        Utilities.Charset.UTF_8
      );


  return digest
    .map(
      function(byte) {

        const value =
          byte < 0
            ? byte + 256
            : byte;


        return value
          .toString(16)
          .padStart(
            2,
            "0"
          );

      }
    )
    .join("");

}


// =====================================================
// VALIDATE SESSION TOKEN FORMAT
// =====================================================

function isValidSessionTokenFormat(
  token
) {

  if (!token) {

    return false;

  }


  token =
    String(token);


  if (
    token.length >
    SESSION_TOKEN_CONFIG.MAX_TOKEN_LENGTH
  ) {

    return false;

  }


  if (
    token.indexOf(
      SESSION_TOKEN_CONFIG.TOKEN_PREFIX
    ) !== 0
  ) {

    return false;

  }


  const value =
    token.substring(
      SESSION_TOKEN_CONFIG.TOKEN_PREFIX.length
    );


  return (
    value.length ===
    SESSION_TOKEN_CONFIG.TOKEN_LENGTH
  ) &&
  /^[a-f0-9]+$/i.test(
    value
  );

}


// =====================================================
// REQUIRE VALID TOKEN FORMAT
// =====================================================

function requireValidSessionToken(
  token
) {

  if (
    !isValidSessionTokenFormat(
      token
    )
  ) {

    throw new Error(
      "Invalid session token"
    );

  }


  return true;

}


// =====================================================
// COMPARE SESSION TOKENS
// =====================================================

function compareSessionTokens(
  tokenA,
  tokenB
) {

  if (
    !tokenA ||
    !tokenB
  ) {

    return false;

  }


  const a =
    String(tokenA);


  const b =
    String(tokenB);


  if (
    a.length !==
    b.length
  ) {

    return false;

  }


  let result =
    0;


  for (
    let i = 0;
    i < a.length;
    i++
  ) {

    result |=
      a.charCodeAt(i) ^
      b.charCodeAt(i);

  }


  return result === 0;

}


// =====================================================
// COMPARE TOKEN HASHES
// =====================================================

function compareSessionTokenHashes(
  hashA,
  hashB
) {

  if (
    !hashA ||
    !hashB
  ) {

    return false;

  }


  return compareSessionTokens(
    String(hashA)
      .toLowerCase(),

    String(hashB)
      .toLowerCase()
  );

}


// =====================================================
// GET TOKEN HASH
// =====================================================

function getSessionTokenHash(
  token
) {

  requireValidSessionToken(
    token
  );


  return hashSessionToken(
    token
  );

}


// =====================================================
// GET TOKEN FINGERPRINT
// =====================================================

function getSessionTokenFingerprint(
  token
) {

  if (!token) {

    return "";

  }


  const hash =
    hashSessionToken(
      token
    );


  return hash.substring(
    0,
    12
  );

}


// =====================================================
// MASK SESSION TOKEN
// =====================================================

function maskSessionToken(
  token
) {

  if (!token) {

    return "";

  }


  token =
    String(token);


  if (
    token.length <= 12
  ) {

    return "********";

  }


  const prefix =
    token.substring(
      0,
      Math.min(
        5,
        token.length
      )
    );


  const suffix =
    token.substring(
      token.length - 4
    );


  return (
    prefix +
    "********" +
    suffix
  );

}


// =====================================================
// GET TOKEN PREFIX
// =====================================================

function getSessionTokenPrefix() {

  return (
    SESSION_TOKEN_CONFIG.TOKEN_PREFIX
  );

}


// =====================================================
// EXTRACT TOKEN FROM REQUEST
// =====================================================

function extractSessionToken(
  request
) {

  request =
    request || {};


  // ---------------------------------------------------
  // Direct token
  // ---------------------------------------------------

  let token =
    request.token ||
    request.sessionToken ||
    request.session_token;


  if (token) {

    return String(token);

  }


  // ---------------------------------------------------
  // Authorization header
  // ---------------------------------------------------

  const headers =
    request.headers ||
    request.Headers ||
    {};


  let authorization =
    headers.Authorization ||
    headers.authorization ||
    "";


  authorization =
    String(
      authorization
    ).trim();


  if (
    /^Bearer\s+/i.test(
      authorization
    )
  ) {

    return authorization
      .replace(
        /^Bearer\s+/i,
        ""
      )
      .trim();

  }


  // ---------------------------------------------------
  // Cookie-style token
  // ---------------------------------------------------

  const cookieToken =
    request.session_cookie ||
    request.sessionCookie ||
    "";


  if (cookieToken) {

    return String(
      cookieToken
    ).trim();

  }


  return "";

}


// =====================================================
// REQUIRE TOKEN FROM REQUEST
// =====================================================

function requireSessionToken(
  request
) {

  const token =
    extractSessionToken(
      request
    );


  requireValidSessionToken(
    token
  );


  return token;

}


// =====================================================
// CREATE TOKEN RECORD
// =====================================================

function createSessionTokenRecord(
  userId,
  role
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  const token =
    generateSessionToken();


  const tokenHash =
    hashSessionToken(
      token
    );


  const fingerprint =
    getSessionTokenFingerprint(
      token
    );


  return {

    token:
      token,

    tokenHash:
      tokenHash,

    fingerprint:
      fingerprint,

    userId:
      userId,

    role:
      role ||
      "",

    createdAt:
      new Date()

  };

}


// =====================================================
// VALIDATE TOKEN
// =====================================================

function validateSessionToken(
  token
) {

  if (
    !token
  ) {

    return {

      valid: false,

      reason:
        "Session token is required"

    };

  }


  if (
    !isValidSessionTokenFormat(
      token
    )
  ) {

    return {

      valid: false,

      reason:
        "Invalid session token format"

    };

  }


  return {

    valid: true,

    token:
      token,

    fingerprint:
      getSessionTokenFingerprint(
        token
      )

  };

}


// =====================================================
// GET TOKEN METADATA
// =====================================================

function getSessionTokenMetadata(
  token
) {

  const validation =
    validateSessionToken(
      token
    );


  if (
    !validation.valid
  ) {

    return validation;

  }


  return {

    valid: true,

    prefix:
      SESSION_TOKEN_CONFIG.TOKEN_PREFIX,

    length:
      String(token).length,

    fingerprint:
      getSessionTokenFingerprint(
        token
      ),

    hash:
      hashSessionToken(
        token
      )

  };

}


// =====================================================
// ROTATE TOKEN VALUE
// =====================================================

function generateReplacementSessionToken(
  oldToken
) {

  requireValidSessionToken(
    oldToken
  );


  let newToken =
    generateSessionToken();


  // ---------------------------------------------------
  // Extremely unlikely collision protection
  // ---------------------------------------------------

  let attempts =
    0;


  while (
    compareSessionTokens(
      newToken,
      oldToken
    ) &&
    attempts < 5
  ) {

    newToken =
      generateSessionToken();

    attempts++;

  }


  return newToken;

}


// =====================================================
// REVOKE TOKEN SAFELY
// =====================================================

function revokeSessionToken(
  token,
  reason
) {

  requireValidSessionToken(
    token
  );


  if (
    typeof revokeSession ===
    "function"
  ) {

    return revokeSession(
      token,
      reason ||
      "Token revoked"
    );

  }


  throw new Error(
    "SessionRevoke module is unavailable"
  );

}


// =====================================================
// CHECK TOKEN REVOCATION
// =====================================================

function checkSessionTokenRevocation(
  token
) {

  requireValidSessionToken(
    token
  );


  if (
    typeof isSessionRevoked ===
    "function"
  ) {

    return isSessionRevoked(
      token
    );

  }


  return {

    revoked: false

  };

}


// =====================================================
// TOKEN SECURITY SUMMARY
// =====================================================

function getSessionTokenSecurityInfo(
  token
) {

  const validation =
    validateSessionToken(
      token
    );


  if (
    !validation.valid
  ) {

    return validation;

  }


  const revoked =
    checkSessionTokenRevocation(
      token
    );


  return {

    valid:
      true,

    fingerprint:
      getSessionTokenFingerprint(
        token
      ),

    masked:
      maskSessionToken(
        token
      ),

    revoked:
      revoked.revoked === true,

    revocationReason:
      revoked.reason ||
      null

  };

}