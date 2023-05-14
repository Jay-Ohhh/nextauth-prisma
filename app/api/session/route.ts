import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse(
            JSON.stringify({
                status: "fail",
                message: "You are not logged in",
            })
        );
    }

    return NextResponse.json({
        authenticated: !!session,
        session,
    });
}