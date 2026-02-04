import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
    // Propagation du token via NextRequest
    return callApiGet(request, "/ecolage/list");
}
