/**
 * Sets refresh token cookie with secure options
 * @param {object} res - Response object
 * @param {string} refreshToken - Plain refresh token
 */
export const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: "/"
    });
};