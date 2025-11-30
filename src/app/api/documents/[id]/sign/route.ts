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
    const body = await request.json();
    const {
      signedAt,
      signature,
      initials,
      signaturePositionX,
      signaturePositionY,
      fileData, // NEW: Accept the modified PDF
    } = body;

    console.log("📥 Received sign request:", {
      documentId,
      userId: user.id,
      hasFileData: !!fileData,
      fileDataLength: fileData?.length,
      fileDataPrefix: fileData?.substring(0, 50),
      signaturePosition: `${signaturePositionX}, ${signaturePositionY}`,
    });

    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    });

    if (!existingDocument) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "NOT_FOUND", message: "Document not found" },
        { status: 404 }
      );
    }

    if (existingDocument.recipientId !== user.id) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: "FORBIDDEN",
          message: "You are not authorized to sign this document",
        },
        { status: 403 }
      );
    }

    if (existingDocument.status === "SIGNED") {
      return NextResponse.json<ApiErrorResponse>(
        { error: "VALIDATION_ERROR", message: "Document is already signed" },
        { status: 400 }
      );
    }

    // Update document with signature and modified PDF
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "SIGNED",
        signedAt: signedAt ? new Date(signedAt) : new Date(),
        fileData: fileData || existingDocument.fileData,
        signaturePositionX,
        signaturePositionY,
        signature,
        initials,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    });

    // await EventLogger.documentSigned(
    //   user.id,
    //   document.id,
    //   document.senderId,
    //   document.title
    // );

    return NextResponse.json<SignDocumentResponse>(
      {
        document: document as any as Document,
        message: "Document signed successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Sign document error:", error);
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
