// import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
// export const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL as string,
//     process.env.NEXT_PUBLIC_SUPABASE_KEY as string
// );

// export const uploadImage = async (image: File, bucket: string) => {
//     const timestamp = Date.now();
//     // const newName = `/users/${timestamp}-${image.name}`;
//     const newName = `${timestamp}-${image.name}`;

//     const { data, error } = await supabase.storage
//         .from(bucket)
//         .upload(newName, image, {
//             cacheControl: "3600"
//         });
//     if (!data) throw new Error("Image upload failed");
//     return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl;
// };

export const uploadImage = async (image: File, bucket: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const formData = new FormData();
    formData.append("image", image);
    formData.append("bucket", bucket);

    const response = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) throw new Error("Image upload failed");
    return response.json();
};

export const deleteImage = async (imageUrl: string, bucket: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, bucket })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete image");

    return data.success;
};

// export const deleteImage = (url: string, bucket: string) => {
//     const imageName = url.split("/").pop();
//     if (!imageName) throw new Error("Invalid URL");
//     return supabase.storage.from(bucket).remove([imageName]);
// };
