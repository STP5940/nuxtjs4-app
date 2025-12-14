// server/utils/token.ts

import { randomRoles } from '~~/constants/roles'

import jwt, { JwtPayload } from 'jsonwebtoken';
import parseDuration from 'parse-duration';
import { setCookie, H3Event } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

import prisma from '~~/lib/prisma'

type UserRole = typeof randomRoles[number];

// ----------------------------------------------------------------------
// 1. Interfaces สำหรับ Payload ของ Tokens
// ----------------------------------------------------------------------

// Payload สำหรับ Access Token (อายุสั้น, ใช้เรียก API)
export interface AccessTokenPayload extends JwtPayload {
    sub: string; // ID ผู้ใช้
    iss: string; // ชื่อแอปของคุณ
    rtid: string; // อ้างอิง Refresh Token ID
    role: UserRole; // บทบาทของผู้ใช้
    username: string; // ชื่อผู้ใช้ (ถ้าต้องการ)
    email?: string; // อีเมลผู้ใช้ (ถ้าต้องการ)
    avatar?: string; // URL รูปประจำตัว (ถ้าต้องการ)
}

// Payload สำหรับ Refresh Token (อายุยาว, ต้องมี jti สำหรับ Revocation)
export interface RefreshTokenPayload extends JwtPayload {
    sub: string; // ID ผู้ใช้
    iss: string; // ชื่อแอปของคุณ
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
 * สร้าง Access Token
 * @param userId ID ผู้ใช้
 * @param role บทบาทของผู้ใช้
 * @param refreshTokenId ID ของ Refresh Token ที่เกี่ยวข้อง
 * @returns Access Token string
 */
export async function generateAccessToken(userId: string, role: UserRole, iss: string, refreshTokenId: string) {
    // ค้นหาผู้ใช้จาก userId
    const findingUser = await prisma.users.findUnique({
        where: {
            id: String(userId)
        }
    });

    if (!findingUser) {
        throw new Error('User not found when generating access token');
    }

    const accessTokenPayload: AccessTokenPayload = {
        sub: userId, // ID ผู้ใช้
        rtid: refreshTokenId, // อ้างอิง Refresh Token ID
        role,
        username: findingUser?.username,
        ...(findingUser?.email && { email: findingUser.email }),
        ...(findingUser?.avatar && { avatar: findingUser.avatar }),
        iss: iss, // ชื่อแอปของคุณ
    };

    const accessToken = jwt.sign(
        accessTokenPayload,
        ACCESS_SECRET,
        { expiresIn: getAccessTokenMaxAge() / 1000 } // Convert to seconds
    );

    return {
        accessToken // Access Token string
    };
}

/**
 * สร้าง Refresh Token
 * @param userId ID ผู้ใช้
 * @param refreshTokenId ID ของ Refresh Token (jti)
 * @returns Object ที่ประกอบด้วย Refresh Token string และ ID สำหรับบันทึกใน DB
 */
export function generateRefreshToken(userId: string, iss: string) {
    const refreshTokenId = uuidv4();

    const refreshTokenPayload: RefreshTokenPayload = {
        sub: userId,
        jti: refreshTokenId, // ใช้สำหรับอ้างอิงในฐานข้อมูล
        iss: iss, // ชื่อแอปของคุณ
    };

    const refreshToken = jwt.sign(
        refreshTokenPayload,
        REFRESH_SECRET,
        { expiresIn: getRefreshTokenMaxAge() / 1000 } // Convert to seconds
    );

    return {
        refreshToken, // Refresh Token string
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

/**
 * ถอดรหัสและตรวจสอบความถูกต้องของ Access Token
 * @param token Access Token ที่เป็น string
 * @returns Payload ของ Token หากถูกต้อง, หรือ null หากไม่ถูกต้อง (เช่น หมดอายุ, signature ไม่ตรง)
 */
export function decodeAccessToken(token: string): AccessTokenPayload | null {
    try {
        // ใช้ ACCESS_SECRET ในการตรวจสอบและถอดรหัส token
        const payload = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
        return payload;
    } catch (error) {
        // หากเกิด error แสดงว่า token ไม่ถูกต้อง
        console.error("❌ Invalid or expired access token");
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
กำหนด Access Token ลงใน Cookie ของ Response
@param event H3 Event object
@param accessToken Access Token
*/
export function setAccessTokenCookie(event: H3Event, accessToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const ACCESS_TOKEN_MAX_AGE_MS = getAccessTokenMaxAge();

    setCookie(event, 'access_token', accessToken, {
        httpOnly: false, // ⚠️ เพื่อให้ JavaScript อ่านได้
        secure: isProduction, // ใช้เฉพาะกับ HTTPS ใน production
        sameSite: 'lax', // ⭐ lax เพื่อป้องกัน CSRF ในขณะที่ยังคงใช้งานได้ง่าย
        maxAge: Math.floor(ACCESS_TOKEN_MAX_AGE_MS / 1000), // เปลี่ยนเป็นวินาที
        path: '/', // ใช้ได้กับทุก path
    });

}

/**
กำหนด Refresh Token ลงใน Cookie ของ Response
@param event H3 Event object
@param refreshToken Refresh Token
*/
export function setRefreshTokenCookie(event: H3Event, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const REFRESH_TOKEN_MAX_AGE_MS = getRefreshTokenMaxAge();

    setCookie(event, 'refresh_token', refreshToken, {
        httpOnly: true, // ⚠️ เพื่อให้ JavaScript อ่านได้
        secure: isProduction, // ใช้เฉพาะกับ HTTPS ใน production
        sameSite: 'strict', // ⭐ strict เพื่อป้องกัน CSRF อย่างเข้มงวดสูงสุด
        maxAge: Math.floor(REFRESH_TOKEN_MAX_AGE_MS / 1000), // เปลี่ยนเป็นวินาที
        path: '/', // ใช้ได้กับทุก path
    });

}

/**
แฮช Token ด้วย SHA-256
@param token Token ที่ต้องการแฮช
@returns ค่าแฮชของ Token ในรูปแบบ hexadecimal string
*/
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}