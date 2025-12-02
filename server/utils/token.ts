import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { randomRoles } from '~~/constants/roles'

type UserRole = typeof randomRoles[number];

// ----------------------------------------------------------------------
// 1. Interfaces สำหรับ Payload ของ Tokens
// ----------------------------------------------------------------------

// Payload สำหรับ Access Token (อายุสั้น, ใช้เรียก API)
interface AccessTokenPayload extends JwtPayload {
    userId: number;
    role: UserRole;
}

// Payload สำหรับ Refresh Token (อายุยาว, ต้องมี tokenId สำหรับ Revocation)
interface RefreshTokenPayload extends JwtPayload {
    userId: number;
    tokenId: string; // ใช้สำหรับอ้างอิงในฐานข้อมูล
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
export function generateTokens(userId: number, role: UserRole) {

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
        tokenId: refreshTokenId, // ผูก ID เข้ากับ Token
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