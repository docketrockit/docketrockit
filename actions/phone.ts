'use server';

import * as z from 'zod';
import { User } from '@/generated/prisma';

import { db } from '@/lib/database';
import { ActionResult } from '@/types/global';
import {
    ChangePhoneSchema,
    VerifyPhoneChangeOTPSchema
} from '@/schemas/security';
import { authCheckServer } from '@/lib/authCheck';
import { calculateCooldownSeconds } from '@/utils/ratelimit';
import { generateOTP } from '@/utils/otp';
import { sendSingleSMSAction } from '@/actions/smsglobal';
import { SMSMessage } from '@/types/smsglobal';

const RATE_LIMIT_MAX_ATTEMPTS = 3;
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

export const sendPhoneChangeOTP = async (
    values: z.infer<typeof ChangePhoneSchema>
): Promise<ActionResult> => {
    const userSession = await authCheckServer();

    if (!userSession) {
        return {
            success: false,
            message: 'Not authorised'
        };
    }

    try {
        const validatedFields = ChangePhoneSchema.safeParse(values);

        if (!validatedFields.success) {
            return {
                success: false,
                message: 'Invalid fields'
            };
        }

        const { currentPhoneNumber, newPhoneNumber } = validatedFields.data;

        if (currentPhoneNumber === newPhoneNumber) {
            return {
                success: false,
                message:
                    'New phone number must be different from current phone number'
            };
        }

        let user: User | null;
        if (currentPhoneNumber) {
            user = await db.users.findByPhoneNumber(currentPhoneNumber);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
        } else {
            user = await db.users.findById(userSession.user.id);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
        }

        // Check if new phone number is already taken
        const existingUser = await db.users.findByPhoneNumber(newPhoneNumber);
        if (existingUser) {
            return {
                success: false,
                message: 'Phone number is already in use'
            };
        }

        // Rate limiting
        const rateLimitKey = `phone_change:${user.id}`;
        const rateLimit = await db.rateLimits.get(rateLimitKey);

        if (rateLimit && rateLimit.count >= RATE_LIMIT_MAX_ATTEMPTS) {
            const cooldownTime = calculateCooldownSeconds(rateLimit.resetTime);
            return {
                success: false,
                message: 'Too many attempts. Please try again later.',
                cooldownTime
            };
        }

        // Increment rate limit
        await db.rateLimits.increment(rateLimitKey);

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY);

        // Clean up old OTP records
        await db.phoneChangeRecords.cleanup();
        await db.phoneChangeRecords.deleteByUserId(user.id);

        // Create new OTP record
        await db.phoneChangeRecords.create({
            userId: user.id,
            phoneNumber: currentPhoneNumber || 'New number',
            newPhoneNumber,
            otp,
            expiresAt
        });

        const smsMessage: SMSMessage = {
            destination: newPhoneNumber,
            message: `Your verification code for Buxmate is: ${otp}. This code will expire in 10 minutes.`
        };

        console.log(
            `Your verification code for Buxmate is: ${otp}. This code will expire in 10 minutes.`
        );
        // const response = await sendSingleSMSAction(smsMessage);

        // if (!response.messages) {
        //     return {
        //         success: false,
        //         message: 'Failed to send verification message'
        //     };
        // }

        return {
            success: true,
            message: 'Verification code sent successfully! Check your phone.',
            data: {
                expiresIn: OTP_EXPIRY / 1000
            }
        };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return {
            success: false,
            message: 'An error occurred while sending the verification code'
        };
    }
};

export async function verifyPhoneChangeOTP(
    values: z.infer<typeof VerifyPhoneChangeOTPSchema>
): Promise<ActionResult> {
    const userSession = await authCheckServer();

    if (!userSession) {
        return {
            success: false,
            message: 'Not authorised'
        };
    }

    try {
        const validatedFields = VerifyPhoneChangeOTPSchema.safeParse(values);

        if (!validatedFields.success) {
            return {
                success: false,
                message: 'Invalid fields'
            };
        }

        const { currentPhoneNumber, newPhoneNumber, otp } =
            validatedFields.data;

        let user: User | null;
        if (currentPhoneNumber && currentPhoneNumber !== 'New number') {
            user = await db.users.findByPhoneNumber(currentPhoneNumber);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
        } else {
            user = await db.users.findById(userSession.user.id);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
        }

        // Find valid OTP record
        const phoneChangeRecord = await db.phoneChangeRecords.findValid(
            user.id,
            newPhoneNumber
        );
        if (!phoneChangeRecord) {
            return {
                success: false,
                message: 'Invalid or expired verification code'
            };
        }

        // Verify OTP
        if (phoneChangeRecord.otp !== otp) {
            // Increment attempts
            await db.emailChangeRecords.incrementAttempts(phoneChangeRecord.id);

            const remainingAttempts = 3 - (phoneChangeRecord.attempts + 1);

            // Audit log for failed attempt

            if (remainingAttempts <= 0) {
                await db.phoneChangeRecords.deleteByUserId(user.id);
                return {
                    success: false,
                    message:
                        'Too many failed attempts. Please request a new code.'
                };
            }

            return {
                success: false,
                message: `Invalid code. ${remainingAttempts} attempts remaining.`
            };
        }

        // Check if new email is still available
        const existingUser = await db.users.findByPhoneNumber(newPhoneNumber);
        if (existingUser && existingUser.id !== user.id) {
            return {
                success: false,
                message: 'Phone number is no longer available'
            };
        }

        // Update user email
        const updatedUser = await db.users.updatePhoneNumber(
            user.id,
            newPhoneNumber
        );
        if (!updatedUser) {
            return {
                success: false,
                message: 'Failed to update phone number'
            };
        }

        // Clean up OTP record
        await db.phoneChangeRecords.deleteByUserId(user.id);

        // Audit log for successful change

        return {
            success: true,
            message: 'Phone number updated successfully!',
            data: {
                newPhoneNumber
            }
        };
    } catch (error) {
        return {
            success: false,
            message: 'Internal server error'
        };
    }
}
