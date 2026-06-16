import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const { videoId } = await params;

    const student = await db.student.findFirst({
      where: {
        userId: session.userId,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false },
        { status: 404 }
      );
    }

    const video = await db.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      return NextResponse.json(
        { success: false },
        { status: 404 }
      );
    }

    const existing = await db.videoWatch.findFirst({
      where: {
        studentId: student.id,
        videoId,
      },
    });

    if (existing?.isCompleted) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
      });
    }

    await db.$transaction(async (tx) => {
        if (existing) {
            await tx.videoWatch.update({
              where: {
                id: existing.id,
              },
              data: {
                isCompleted: true,
              },
            });
          } else {
            await tx.videoWatch.create({
              data: {
                studentId: student.id,
                videoId,
                isCompleted: true,
              },
            });
          }

          await tx.student.update({
            where: {
              id: student.id,
            },
            data: {
              totalPoints: {
                increment: video.pointReward ?? 10,
              },
            },
          });

          await tx.pointLog.create({
            data: {
              studentId: student.id,
              pointsEarned: video.pointReward ?? 10,
              sourceType: "VIDEO",
              sourceId: video.id,
              description: `Menyelesaikan video ${video.title}`,
            },
          });
        });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}