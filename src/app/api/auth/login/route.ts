import { NextResponse, NextRequest } from "next/server";
import { getServerAxios } from "@/lib/getServerAxios";
import axios from "axios";
export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Utilisation de getServerAxios pour appeler ton backend
    const serverApi = getServerAxios(request);
    const backendResponse = await serverApi.post("/utilisateur/login", {
      email,
      mdp: password,
    });

    const data = backendResponse.data.data; // token et infos utilisateur

    

    // Création de la réponse côté Next.js
    const response = NextResponse.json(
      { message: "Connexion réussie", token: data.token, membre: data.membre },
      { status: 200 }
    );

    // Stockage du token dans un cookie HTTP-only
    response.cookies.set("auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 jours ou 24h
    });

    return response;
  } catch (error: unknown) {
    console.error("Erreur login Next.js:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        return NextResponse.json(
          { message: error.response.data?.message || "Erreur backend" },
          { status: error.response.status }
        );
      } else {
        return NextResponse.json(
          { message: "Pas de réponse du backend ou erreur réseau" },
          { status: 503 }
        );
      }
    }

    const message = error instanceof Error ? error.message : "Erreur interne serveur";
    return NextResponse.json({ message }, { status: 500 });
  }
}
