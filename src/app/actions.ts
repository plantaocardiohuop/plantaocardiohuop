'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

async function auth() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('Missing ADMIN_PASSWORD');

  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  if (!authHeader) throw new Error('Unauthorized');

  const authValue = authHeader.split(' ')[1];
  if (!authValue) throw new Error('Unauthorized');

  const decoded = atob(authValue);
  const [, suppliedPassword] = decoded.split(':');

  if (suppliedPassword !== password) throw new Error('Unauthorized');
}

export async function addMember(formData: FormData) {
  try {
    await auth();
    const name = formData.get('name');
    if (!name || typeof name !== 'string' || name.length > 255) return;

    await prisma.member.create({
      data: {
        name,
        points: 0,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
  } catch {
    return;
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    await auth();
    if (!memberId || typeof memberId !== 'number') return;
    if (typeof meetingName !== 'string' || meetingName.length > 255) return;

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
  } catch {
    return;
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    await auth();
    if (!memberId || typeof memberId !== 'number') return;
    if (!amount || typeof amount !== 'number' || amount < 0 || amount > 1000) return;
    if (!reason || typeof reason !== 'string' || reason.length > 255) return;

    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: {
          memberId,
          amount,
          reason,
        }
      }),
      prisma.member.update({
        where: { id: memberId },
        data: { points: { increment: amount } }
      })
    ]);

    revalidatePath('/');
    revalidatePath('/admin');
  } catch {
    return;
  }
}

export async function deleteMember(memberId: number) {
  try {
    await auth();
    if (!memberId || typeof memberId !== 'number') return;

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
  } catch {
    return;
  }
}
