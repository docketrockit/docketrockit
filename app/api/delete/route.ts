import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../supabase/client";

export async function POST(req: NextRequest) {
    try {
        const { imageUrl, bucket } = await req.json();

        if (!imageUrl || !bucket) {
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        // Extract image name from the URL
        const imageName = imageUrl.split("/").pop();
        if (!imageName) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        const { error } = await supabase.storage
            .from(bucket)
            .remove([imageName]);

        if (error) {
            return NextResponse.json(
                { error: "Image deletion failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
