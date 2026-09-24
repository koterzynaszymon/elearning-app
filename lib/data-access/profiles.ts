"use server";

import { createClient } from "@/lib/supabase/server";
import { ProfileType, Result, UpdateProfileInput } from "@/app/types/profile";
import { AVATAR_BUCKET, avatarObjectPath } from "@/lib/supabase/avatar";

export async function getProfileByUserId(userId: string): Promise <ProfileType | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('profiles').select("*").eq('id', userId).single();
    if (error) {
        console.error(error);
        return null;
    }
    return data as ProfileType;
}

export async function updateProfileByUserId( {username, bio} : UpdateProfileInput): Promise<Result<ProfileType>> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "User not found" };
    }

    const userId = user.id;
    username = username.trim();
    bio = bio?.trim() || null;
    if (!username || username.length < 3 || username.length > 40) {
        return { success: false, error: "Username must be between 3 and 40 characters" };
    }
    if (bio && bio.length > 200) {
        return { success: false, error: "Bio must be less than 200 characters" };
    }

    const { data, error } = await supabase.from("profiles").update({ username, bio}).eq("id", userId).select().single();
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, data: data as ProfileType };
}

export async function updateProfileAvatarUrl(avatarUrl: string | null): Promise<Result<ProfileType>> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "User not found" };
    }

    const userId = user.id;

    if (avatarUrl !== null) {
        const expectedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/${avatarObjectPath(userId)}`;
        if (!avatarUrl.startsWith(expectedPrefix)) {
            return { success: false, error: "Invalid avatar URL" };
        }
    }

    const { data, error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId).select().single();
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, data: data as ProfileType };
}