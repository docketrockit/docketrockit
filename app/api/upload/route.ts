import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../supabase/client";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const bucket = formData.get("bucket") as string;

    if (!image || !bucket) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const timestamp = Date.now();
    const newName = `${timestamp}-${image.name}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(newName, image, { cacheControl: "3600" });

    if (error) {
        return NextResponse.json(
            { error: "Image upload failed" },
            { status: 500 }
        );
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(newName)
        .data.publicUrl;
    return NextResponse.json({ publicUrl });
}
