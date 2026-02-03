import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
    // Backend path: /ecolage/insert
    return callApiPost(request, "/ecolage/insert", []);
}
