import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
    return callApiPost(request, "/pre-inscription/search", []);
}
