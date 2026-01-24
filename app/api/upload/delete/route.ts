import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteImage } from "@/shared/lib/cloudinary";

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "publicIdが必要です" },
        { status: 400 },
      );
    }

    // Cloudinaryから画像を削除
    await deleteImage(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("画像削除エラー:", error);
    return NextResponse.json(
      { error: "画像の削除に失敗しました" },
      { status: 500 },
    );
  }
}
