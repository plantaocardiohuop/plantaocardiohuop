'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name');
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return { error: 'Invalid name provided' };
    }

    await prisma.member.create({
      data: {
        name: name.trim(),
        points: 0,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Operation failed', error);
    return { error: 'An error occurred while creating member' };
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    if (!memberId || typeof memberId !== 'number' || memberId <= 0) {
      return { error: 'Invalid member ID' };
    }
    if (typeof meetingName !== 'string' || meetingName.length > 200) {
      return { error: 'Invalid meeting name' };
    }

    const points = 10; // 10 points for attending a meeting

    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: {
          memberId,
          amount: points,
          reason: `Presença: ${meetingName}`,
        }
      }),
      prisma.member.update({
        where: { id: memberId },
        data: { points: { increment: points } }
      })
    ]);

    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Operation failed', error);
    return { error: 'An error occurred while recording attendance' };
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    if (!memberId || typeof memberId !== 'number' || memberId <= 0) {
      return { error: 'Invalid member ID' };
    }
    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 1000) {
      return { error: 'Invalid amount' };
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0 || reason.length > 200) {
      return { error: 'Invalid reason' };
    }

    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: {
          memberId,
          amount,
          reason: reason.trim(),
        }
      }),
      prisma.member.update({
        where: { id: memberId },
        data: { points: { increment: amount } }
      })
    ]);

    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Operation failed', error);
    return { error: 'An error occurred while adding bonus points' };
  }
}

export async function deleteMember(memberId: number) {
  try {
    if (!memberId || typeof memberId !== 'number' || memberId <= 0) {
      return { error: 'Invalid member ID' };
    }

    await prisma.$transaction([
      prisma.pointTransaction.deleteMany({
        where: { memberId }
      }),
      prisma.member.delete({
        where: { id: memberId }
      })
    ]);

    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Operation failed', error);
    return { error: 'An error occurred while deleting member' };
  }
}
