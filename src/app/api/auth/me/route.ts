import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ma_cle_secrete";

interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    
    const user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
