import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
    // Backend path must be /ecolage/list
    return callApiGet(request, "/ecolage/list", []);
}
