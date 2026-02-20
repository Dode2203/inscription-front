// src/app/api/etudiants/statistiques/route.ts
import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";
export async function GET(request: NextRequest) {
         const allowedParams = ["nbJours"];
   
     return callApiGet(request, "/etudiants/statistiques", allowedParams);
}