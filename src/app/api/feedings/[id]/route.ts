import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the feeding belongs to the user
    const feeding = await prisma.feeding.findUnique({
      where: { id },
    });

    if (!feeding || feeding.userId !== session.user.id) {
      return NextResponse.json({ error: "Feeding not found" }, { status: 404 });
    }

    const body = await req.json();
    const { side, startedAt, endedAt, notes, tags } = body;

    const durationSeconds = endedAt
      ? Math.floor(
          (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
        )
      : feeding.durationSeconds;

    // Delete existing tags if new ones are provided
    if (tags) {
      await prisma.feedingTags.deleteMany({
        where: { feedingId: id },
      });
    }

    const updatedFeeding = await prisma.feeding.update({
      where: { id },
      data: {
        side: side || feeding.side,
        startedAt: startedAt ? new Date(startedAt) : feeding.startedAt,
        endedAt: endedAt ? new Date(endedAt) : feeding.endedAt,
        durationSeconds,
        notes: notes !== undefined ? notes : feeding.notes,
        tags: tags
          ? {
              create: tags.map((tag: string) => ({ tag })),
            }
          : undefined,
      },
      include: { tags: true },
    });

    return NextResponse.json(updatedFeeding);
  } catch (error) {
    console.error("Error updating feeding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the feeding belongs to the user
    const feeding = await prisma.feeding.findUnique({
      where: { id },
    });

    if (!feeding || feeding.userId !== session.user.id) {
      return NextResponse.json({ error: "Feeding not found" }, { status: 404 });
    }

    await prisma.feeding.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feeding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
