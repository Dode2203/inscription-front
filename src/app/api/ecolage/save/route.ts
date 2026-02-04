import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
    // Propagation du token via NextRequest
    return callApiPost(request, "/ecolage/insert");
}
