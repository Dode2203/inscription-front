// lib/apiHandler.ts
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
import { getServerAxios } from "@/lib/getServerAxios";
import { error } from "console";

export async function callApiGet(
  request: NextRequest,
  url: string,
  allowedParams: string[] = []
) {
  try {
    const api = getServerAxios(request);

    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, string> = {};

    // Générer automatiquement les paramètres autorisés
    allowedParams.forEach((key) => {
      const value = searchParams.get(key);
      if (value) queryParams[key] = value;
    });

    const response = await api.get(url, { params: queryParams });
    return NextResponse.json(response.data);
  } 
  catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        const status = err.response.status || 500;
        const data = err.response.data || {};

        const msg =
          data.message ||
          data.error ||
          (typeof data === "string" ? data : JSON.stringify(data)) ||
          "Erreur interne lors de l'appel au service";

        return NextResponse.json({ error: msg }, { status });
      }

      return NextResponse.json(
        { error: err.message || "Erreur de connexion au service backend." },
        { status: 503 }
      );
    }

    console.error("Erreur inconnue :", err);
    return NextResponse.json(
      { error: "Erreur interne inconnue du serveur" },
      { status: 500 }
    );
  }
}

export async function callApiPost(
  request: NextRequest,
  url: string,
  requiredFields: string[] = []
) {
  try {
    const api = getServerAxios(request);

    const body = await request.json();
    const missingFields: string[] = [];

    // Vérification des champs requis
    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Champs requis manquants : " + missingFields.join(", "),
          error: "Champs requis manquants : " + missingFields.join(", "),
          missingFields,
        },
        { status: 400 }
      );
    }

    // Body envoyé tel quel
    const response = await api.post(url, body, {
      headers: { "Content-Type": "application/json" },
    });

    return NextResponse.json(
      { message: "Créé avec succès", data: response.data },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;

      return NextResponse.json(
        { error: msg },
        { status: err.response?.status || 500 }
      );
    }

    console.error("Erreur inconnue sur l'api post:", err);
    return NextResponse.json(
      { error: "Erreur interne inconnue du serveur" },
      { status: 500 }
    );
  }
}

export async function callApiPut(
  request: NextRequest,
  url: string,
  requiredFields: string[] = []
) {
  try {
    const api = getServerAxios(request);

    const body = await request.json();
    const missingFields: string[] = [];

    // Vérification des champs requis
    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Champs requis manquants : " + missingFields.join(", "),
          error: "Champs requis manquants : " + missingFields.join(", "),
          missingFields,
        },
        { status: 400 }
      );
    }

    // Body envoyé tel quel
    const response = await api.put(url, body, {
      headers: { "Content-Type": "application/json" },
    });

    return NextResponse.json(
      { message: "Créé avec succès", data: response.data },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;

      return NextResponse.json(
        { error: msg },
        { status: err.response?.status || 500 }
      );
    }

    console.error("Erreur inconnue sur l'api put:", err);
    return NextResponse.json(
      { error: "Erreur interne inconnue du serveur" },
      { status: 500 }
    );
  }
}