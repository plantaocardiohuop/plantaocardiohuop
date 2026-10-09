'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  const name = formData.get('name') as string
  if (!name || typeof name !== 'string' || name.length > 100) {
    return { error: 'Invalid name provided' }
  }

  try {
    await prisma.member.create({
      data: {
        name,
        points: 0,
      },
    })
  } catch (error) {
    console.error('Failed to add member:', error)
    return { error: 'An error occurred while adding the member' }
  }

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  if (!memberId || isNaN(memberId)) return { error: 'Invalid member ID' };
  if (typeof meetingName !== 'string' || meetingName.length > 200) return { error: 'Invalid meeting name' };

  const points = 10; // 10 points for attending a meeting

  try {
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
  } catch (error) {
    console.error('Failed to record attendance:', error);
    return { error: 'An error occurred while recording attendance' };
  }

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  if (!memberId || isNaN(memberId)) return { error: 'Invalid member ID' };
  if (!amount || isNaN(amount) || amount <= 0 || amount > 1000000) return { error: 'Invalid amount' };
  if (!reason || typeof reason !== 'string' || reason.length > 200) return { error: 'Invalid reason' };

  try {
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
  } catch (error) {
    console.error('Failed to add bonus points:', error);
    return { error: 'An error occurred while adding bonus points' };
  }

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function deleteMember(memberId: number) {
  if (!memberId || isNaN(memberId)) return { error: 'Invalid member ID' };

  try {
    await prisma.$transaction([
      prisma.pointTransaction.deleteMany({
        where: { memberId }
      }),
      prisma.member.delete({
        where: { id: memberId }
      })
    ]);
  } catch (error) {
    console.error('Failed to delete member:', error);
    return { error: 'An error occurred while deleting the member' };
  }

  revalidatePath('/')
  revalidatePath('/admin')
}
