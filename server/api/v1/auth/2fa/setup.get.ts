import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import prisma from '~~/lib/prisma'

import { generateSecret } from 'node-2fa';

export default defineEventHandler(async (event) => {
    const { responseSuccess, responseUnauthorized } = useResponseHandler(event);

    const accessToken = getCookie(event, 'access_token');

    // ตรวจสอบว่ามี accessToken หรือไม่
    if (!accessToken) {
        return responseUnauthorized('No token provided');
    }

    const userPayload = decodeAccessToken(accessToken);

    const config = useRuntimeConfig(event);
    const appName = config.public.appName;
    const userId = userPayload?.sub;
    const userName = userPayload?.username?.toUpperCase() || 'USER';

    // Verify that userId is available
    if (!userId) {
        return responseUnauthorized('userid not found in token');
    }

    // ค้นหาผู้ใช้จาก userId ใน token
    const findingTwofactor = await prisma.twofactor.findUnique({
        where: {
            userid: String(userId)
        }
    })

    if (!findingTwofactor) {
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "2FA setup not found for this user"
        });
    }

    const secretKey = findingTwofactor.secret;

    // Create otpauth URL for QR code
    const qrCodeValue = `otpauth://totp/${appName}:${userName}?secret=${secretKey}&issuer=${appName}`;

    return responseSuccess({
        appname: appName,
        userid: userId,
        secretkey: secretKey,
        qrcodevalue: qrCodeValue
    }, "2FA setup info retrieved successfully");
})