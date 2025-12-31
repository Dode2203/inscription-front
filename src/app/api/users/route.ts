import { type NextRequest, NextResponse } from "next/server"
import { getServerAxios } from "@/lib/getServerAxios";
import axios from "axios";
import { callApiGet, callApiPost } from "@/lib/callApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // 1️⃣ GET one user
  if (id) {
    return callApiGet(request, `/utilisateur/${id}`);
  }

  // 2️⃣ GET all users
  return callApiGet(request, "/utilisateur");
}

export async function POST(request: NextRequest) {
   const required = ["nom", "prenom", "email","mdp","role"];
   
     
     return callApiPost(request, "/utilisateur", required);
}

export async function PUT(request: NextRequest) {
  const api = getServerAxios(request);
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) throw new Error("ID requis pour la mise à jour");

    const body = await request.json();
    const payload: Record<string, string> = {
      nom: body.nom,
      prenom: body.prenom,
      email: body.email,
      status: body.status,
      role: body.role
    };
    if (body.password) payload.mdp = body.password;

    const response = await api.put(`/utilisateur/${id}`, payload);
    return NextResponse.json(response.data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return NextResponse.json(
        { error: err.response?.data?.message || err.message },
        { status: err.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}