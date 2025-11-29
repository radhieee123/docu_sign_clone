import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/db";
import { verifyToken, extractTokenFromHeader } from "@/services/auth";
import { EventLogger } from "@/services/eventLogger";
import {
  SignDocumentRequest,
  SignDocumentResponse,
  Document,
  ApiErrorResponse,
} from "@/types";

export async function POST(
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
    const body: SignDocumentRequest = await request.json();
    const { signedAt, signature, initials } = body;

    console.log("Signing document:", {
      documentId,
      userId: user.id,
      signedAt,
    });

    const existingDocument = await prisma.document.findUnique({
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

    if (!existingDocument) {
      console.error("Document not found:", documentId);
      return NextResponse.json<ApiErrorResponse>(
        { error: "NOT_FOUND", message: "Document not found" },
        { status: 404 }
      );
    }

    // Verify user is the recipient
    if (existingDocument.recipientId !== user.id) {
      console.error("User is not the recipient:", {
        userId: user.id,
        recipientId: existingDocument.recipientId,
      });
      return NextResponse.json<ApiErrorResponse>(
        {
          error: "FORBIDDEN",
          message: "You are not authorized to sign this document",
        },
        { status: 403 }
      );
    }

    // Check if already signed
    if (existingDocument.status === "SIGNED") {
      console.warn("Document already signed:", documentId);
      return NextResponse.json<ApiErrorResponse>(
        { error: "VALIDATION_ERROR", message: "Document is already signed" },
        { status: 400 }
      );
    }

    // Update document status
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "SIGNED",
        signedAt: signedAt ? new Date(signedAt) : new Date(),
        // You can add signature and initials fields if you have them in your schema
        // signature: signature,
        // initials: initials,
      },
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

    console.log("Document signed successfully:", document.id);

    // Log the event
    await EventLogger.documentSigned(
      user.id,
      document.id,
      document.senderId,
      document.title
    );

    // TODO: Send email notification to sender
    // await sendEmailNotification(document.sender.email, document);

    return NextResponse.json<SignDocumentResponse>(
      {
        document: document as any as Document,
        message: "Document signed successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Sign document error:", error);
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

// GET /api/documents/[id]/sign - Get document signing status (optional)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeader(
      request.headers.get("Authorization") || ""
    );

    if (!token) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "UNAUTHORIZED", message: "No authorization token provided" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "UNAUTHORIZED", message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const documentId = params.id;

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
      return NextResponse.json<ApiErrorResponse>(
        { error: "NOT_FOUND", message: "Document not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this document
    if (document.senderId !== user.id && document.recipientId !== user.id) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: "FORBIDDEN",
          message: "You do not have access to this document",
        },
        { status: 403 }
      );
    }

    return NextResponse.json<Document>(document as any as Document, {
      status: 200,
    });
  } catch (error) {
    console.error("Get document error:", error);
    return NextResponse.json<ApiErrorResponse>(
      { error: "SERVER_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
