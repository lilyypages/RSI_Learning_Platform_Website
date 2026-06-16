import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 
import bcrypt from "bcryptjs"; 
import { writeFile } from "fs/promises";
import path from "path";

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId") as string;
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const image = formData.get("image") as File | null;
    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID tidak ditemukan" }, { status: 400 });
    }
    // 1. Ambil data user
    const user = await db.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    let updateData: any = {};

    // 2. Handle Password Update
    if (oldPassword && newPassword) {
      // Menggunakan 'user.passwordHash' sesuai dengan hasil debug Anda
      if (!user.passwordHash) {
        return NextResponse.json({ success: false, message: "Password belum diset, silakan hubungi admin." }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "Password lama salah!" }, { status: 401 });
      }

      // Hash password baru dan update ke field yang benar
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // 3. Handle File Upload
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Simpan file ke folder public/uploads
      const filename = `${Date.now()}-${image.name.replace(/\s/g, '_')}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", filename);
      
      await writeFile(uploadPath, buffer);
      
      // Update field imageUrl (sesuaikan dengan nama kolom di schema Anda, 
      // di log Anda terlihat 'imageUrl' camelCase)
      updateData.imageUrl = `/uploads/${filename}`;
    }

    // 4. Eksekusi Update ke Database
    if (Object.keys(updateData).length > 0) {
      await db.user.update({
        where: { id: userId },
        data: updateData
      });
    }

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui!" });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}