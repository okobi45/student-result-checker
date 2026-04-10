import jwt from "jsonwebtoken";

//I setup this for JWT and cookie configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const COOKIE_NAME = process.env.COOKIE_NAME || 'src_auth';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';


//if JWT_SECRET is not set, throw an error
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Check your .env file');
}

//Added only user id and role
export function signToken(user) {
    return jwt.sign(
        { sub: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

//if the token is invalid or expired, this line will throw an error
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'strict' : 'lax',
    maxAge: 1000 * 60 * 60, // 1 hour
};

export { COOKIE_NAME };