'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    if (!name || name.length > 255) return { error: 'Invalid name' };

    await prisma.member.create({
      data: { name: name.trim(), points: 0 },
    });

    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Operation failed', error);
    return { error: 'An error occurred' };
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    if (!memberId || meetingName.length > 255) return { error: 'Invalid input' };
    const points = 10;

    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: { memberId, amount: points, reason: `Presença: ${meetingName}` }
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
    return { error: 'An error occurred' };
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    if (!memberId || !amount || amount <= 0 || amount > 10000 || !reason || reason.length > 255) {
      return { error: 'Invalid input' };
    }

    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: { memberId, amount, reason }
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
    return { error: 'An error occurred' };
  }
}

export async function deleteMember(memberId: number) {
  try {
    if (!memberId) return { error: 'Invalid input' };

    await prisma.$transaction([
      prisma.pointTransaction.deleteMany({ where: { memberId } }),
      prisma.member.delete({ where: { id: memberId } })
    ]);

    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Operation failed', error);
    return { error: 'An error occurred' };
  }
}
