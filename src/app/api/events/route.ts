import { type NextRequest} from "next/server"

import { callApiGet, callApiPost, callApiPut } from "@/lib/callApi";
export async function GET(request: NextRequest) {
   return callApiGet(request, "/evenement", ["limit", "date"]);

}
export async function POST(request: NextRequest) {
  const body = await request.clone().json(); // clone pour lire 2x

  const required = ["titre", "description", "typeEventId"];

  if (body.type === "1") required.push("startDate", "endDate");

  return callApiPost(request, "/evenement", required);
}



/**
 * @method PUT
 * @route /api/evenements (exemple de route Next.js API)
 * Met à jour un événement existant.
 */

export async function PUT(request:NextRequest) {
    const body = await request.clone().json(); // clone pour lire 2x

  const required = ["titre", "description", "typeEventId"];
  const id = body.id;

  if (body.type === "1") required.push("startDate", "endDate");

  return callApiPut(request, `/evenement/${id}`, required);
    
}
