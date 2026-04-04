import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "ffd8ff": "jpg",
  "89504e47": "png",
  "52494646": "webp",
};

function detectImageType(buffer: Buffer): string | null {
  const hex = buffer.subarray(0, 4).toString("hex");
  for (const [magic, ext] of Object.entries(ALLOWED_TYPES)) {
    if (hex.startsWith(magic)) return ext;
  }
  return null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("foto") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen no puede pesar más de 2MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = detectImageType(buffer);

  if (!ext) {
    return NextResponse.json({ error: "Solo se permiten imágenes JPG, PNG o WebP" }, { status: 400 });
  }

  const filename = `${session.user.id}.${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const fotoUrl = `/api/upload/${filename}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { foto: fotoUrl },
  });

  return NextResponse.json({ url: fotoUrl });
}
