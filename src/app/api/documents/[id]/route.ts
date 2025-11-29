import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/db";
import { verifyToken, extractTokenFromHeader } from "@/services/auth";
import { Document, ApiErrorResponse } from "@/types";

// GET /api/documents/[id] - Get a specific document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeader(
      request.headers.get("Authorization") || ""
    );

    if (!token) {
      console.error("No token provided");
      return NextResponse.json<ApiErrorResponse>(
        { error: "UNAUTHORIZED", message: "No authorization token provided" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      console.error("Invalid token");
      return NextResponse.json<ApiErrorResponse>(
        { error: "UNAUTHORIZED", message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const documentId = params.id;

    console.log("Fetching document:", {
      documentId,
      userId: user.id,
    });

    // Fetch the document with sender and recipient info
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      console.error("Document not found:", documentId);
      return NextResponse.json<ApiErrorResponse>(
        { error: "NOT_FOUND", message: "Document not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this document (either sender or recipient)
    if (document.senderId !== user.id && document.recipientId !== user.id) {
      console.error("User does not have access to document:", {
        userId: user.id,
        senderId: document.senderId,
        recipientId: document.recipientId,
      });
      return NextResponse.json<ApiErrorResponse>(
        {
          error: "FORBIDDEN",
          message: "You do not have access to this document",
        },
        { status: 403 }
      );
    }

    console.log("Document fetched successfully:", {
      id: document.id,
      title: document.title,
      hasFileData: !!document.fileData,
      fileDataLength: document.fileData?.length,
      status: document.status,
    });

    return NextResponse.json<Document>(document as any as Document, {
      status: 200,
    });
  } catch (error: any) {
    console.error("Get document error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json<ApiErrorResponse>(
      {
        error: "SERVER_ERROR",
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
