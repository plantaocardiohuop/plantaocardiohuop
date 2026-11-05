'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

async function requireAuth() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('Authentication not configured.');
  }

  const headersList = await headers();
  const basicAuth = headersList.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const decoded = atob(authValue);
    const [, password] = decoded.split(':');

    if (password === adminPassword) {
      return;
    }
  }

  throw new Error('Unauthorized');
}

export async function addMember(formData: FormData) {
  try {
    await requireAuth();
    const name = formData.get('name') as string
    if (!name) return

    await prisma.member.create({
      data: {
        name,
        points: 0,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    console.error('Operation failed');
    return { error: 'An error occurred' };
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    await requireAuth();
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

    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    console.error('Operation failed');
    return { error: 'An error occurred' };
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    await requireAuth();
    if (!amount || !reason) return;

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

    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    console.error('Operation failed');
    return { error: 'An error occurred' };
  }
}

export async function deleteMember(memberId: number) {
  try {
    await requireAuth();
    await prisma.$transaction([
      prisma.pointTransaction.deleteMany({
        where: { memberId }
      }),
      prisma.member.delete({
        where: { id: memberId }
      })
    ]);

    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    console.error('Operation failed');
    return { error: 'An error occurred' };
  }
}
