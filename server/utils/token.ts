// server/utils/token.ts

import jwt, { JwtPayload } from 'jsonwebtoken';
import parseDuration from 'parse-duration';
import { setCookie, H3Event } from 'h3';
import { v4 as uuidv4 } from 'uuid';

import { randomRoles } from '~~/constants/roles'

type UserRole = typeof randomRoles[number];

// ----------------------------------------------------------------------
// 1. Interfaces สำหรับ Payload ของ Tokens
// ----------------------------------------------------------------------

// Payload สำหรับ Access Token (อายุสั้น, ใช้เรียก API)
export interface AccessTokenPayload extends JwtPayload {
    userId: String;
    role: UserRole;
}

// Payload สำหรับ Refresh Token (อายุยาว, ต้องมี jti สำหรับ Revocation)
export interface RefreshTokenPayload extends JwtPayload {
    userId: String;
    jti: string; // ใช้สำหรับอ้างอิงในฐานข้อมูล
}

// ----------------------------------------------------------------------
// 2. การจัดการ Secret Keys
// ----------------------------------------------------------------------

// ดึงค่า Secret Keys จาก Environment Variables
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    // ควรจัดการ Error ที่นี่เพื่อป้องกันการรันโค้ดโดยไม่มี Secret Key
    throw new Error('JWT secrets are not defined in environment variables. Please check your .env file.');
}

// ----------------------------------------------------------------------
// 3. ฟังก์ชันสร้าง Tokens
// ----------------------------------------------------------------------

/**
 * สร้าง Access Token และ Refresh Token คู่กัน
 * @param userId ID ผู้ใช้
 * @param role บทบาทของผู้ใช้
 * @returns Object ที่ประกอบด้วย Tokens และ ID สำหรับบันทึกใน DB
 */
export function generateTokens(userId: String, role: UserRole) {

    // ในการผลิตจริง ควรใช้ uuidv4() เพื่อสร้าง ID ที่ไม่ซ้ำกัน
    const refreshTokenId = uuidv4();

    // 1. สร้าง Access Token (อายุ 15 นาที)
    const accessTokenPayload: AccessTokenPayload = {
        userId,
        role
    };
    const accessToken = jwt.sign(
        accessTokenPayload,
        ACCESS_SECRET,
        { expiresIn: '15m' }
    );

    // 2. สร้าง Refresh Token (อายุ 7 วัน)
    const refreshTokenPayload: RefreshTokenPayload = {
        userId,
        jti: refreshTokenId, // ใช้สำหรับอ้างอิงในฐานข้อมูล
    };
    const refreshToken = jwt.sign(
        refreshTokenPayload,
        REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return {
        accessToken,
        refreshToken,
        refreshTokenId, // ต้องนำค่านี้ไปบันทึกใน Database
    };
}

// ----------------------------------------------------------------------
// 4. ฟังก์ชันตรวจสอบและถอดรหัส Tokens
// ----------------------------------------------------------------------

/**
 * ถอดรหัสและตรวจสอบความถูกต้องของ Refresh Token
 * @param token Refresh Token ที่เป็น string
 * @returns Payload ของ Token หากถูกต้อง, หรือ null หากไม่ถูกต้อง (เช่น หมดอายุ, signature ไม่ตรง)
 */
export function decodeRefreshToken(token: string): RefreshTokenPayload | null {
    try {
        // ใช้ REFRESH_SECRET ในการตรวจสอบและถอดรหัส token
        const payload = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
        return payload;
    } catch (error) {
        // หากเกิด error แสดงว่า token ไม่ถูกต้อง
        console.error("❌ Invalid or expired refresh token");
        return null;
    }
}

// ----------------------------------------------------------------------
// 5. ฟังก์ชันดึงค่า Max Age ของ Tokens
// ----------------------------------------------------------------------

/**
 * ดึงค่า Max Age ของ Refresh Token จาก Environment Variables (ในหน่วยมิลลิวินาที)
 * @returns Max Age ของ Refresh Token ในหน่วยมิลลิวินาที
 */
export function getRefreshTokenMaxAge(): number {
    const DEFAULT_REFRESH_TOKEN_MAX_AGE_MS: number = 7 * 24 * 60 * 60 * 1000; // 7 days
    const refreshDurationString: string = process.env.REFRESH_TOKEN_MAX_AGE || '7d';
    return parseDuration(refreshDurationString) || DEFAULT_REFRESH_TOKEN_MAX_AGE_MS;
}

/**
 * ดึงค่า Max Age ของ Access Token จาก Environment Variables (ในหน่วยมิลลิวินาที)
 * @returns Max Age ของ Access Token ในหน่วยมิลลิวินาที
 */
export function getAccessTokenMaxAge(): number {
    const DEFAULT_ACCESS_TOKEN_MAX_AGE_MS: number = 15 * 60 * 1000; // 15 minutes
    const accessDurationString: string = process.env.ACCESS_TOKEN_MAX_AGE || '15m';
    return parseDuration(accessDurationString) || DEFAULT_ACCESS_TOKEN_MAX_AGE_MS;
}

// ----------------------------------------------------------------------
// 6. ฟังก์ชันกำหนด Cookie
// ----------------------------------------------------------------------

/**
 * กำหนด Access Token และ Refresh Token ลงใน Cookie ของ Response
 * @param event H3 Event object
 * @param accessToken Access Token
 * @param refreshToken Refresh Token
 */
export function setTokenCookies(
    event: H3Event,
    accessToken: string,
    refreshToken: string
) {
    // sameSite: 'lax' or 'strict' or 'none' (ขึ้นกับความต้องการของแอป)

    // 1. จัดการ Refresh Token Cookie
    const REFRESH_TOKEN_MAX_AGE_MS = getRefreshTokenMaxAge();

    // กำหนด refresh token ใน cookie
    setCookie(event, 'refresh_token', refreshToken, {
        httpOnly: false,    // ⚠️ เพื่อให้ JavaScript อ่านได้
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',    // ⭐ แนะนำ: ป้องกัน CSRF + UX ดี
        maxAge: REFRESH_TOKEN_MAX_AGE_MS / 1000, // เปลี่ยนเป็นวินาที
    })

    // 2. จัดการ Access Token Cookie
    const ACCESS_TOKEN_MAX_AGE_MS = getAccessTokenMaxAge();

    // กำหนด access token ใน cookie
    setCookie(event, 'access_token', accessToken, {
        httpOnly: false,    // ⚠️ เพื่อให้ JavaScript อ่านได้
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',    // ⭐ แนะนำ: ป้องกัน CSRF + UX ดี
        maxAge: ACCESS_TOKEN_MAX_AGE_MS / 1000,  // เปลี่ยนเป็นวินาที
    })
}