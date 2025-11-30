"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/apiClient";
import { Document } from "@/types";

export function useDocumentSigning() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signaturePlaced, setSignaturePlaced] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");

  const [signaturePosition, setSignaturePosition] = useState({
    x: 200,
    y: 300,
  });

  const loadDocument = useCallback(async () => {
    if (!params.id) return;

    try {
      const doc = await apiClient.getDocumentById(params.id as string);
      setDocument(doc);

      if (user && doc.recipientId !== user.id) {
        console.warn("User is not the recipient of this document");
      }

      if (doc.status === "SIGNED") {
        setSignaturePlaced(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    setFullName(user.name || "User");
    setInitials(
      user.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("") || "U"
    );

    loadDocument();
  }, [user, loadDocument, router]);

  const adoptSignature = () => {
    setShowSignatureModal(false);
    setSignaturePlaced(true);
  };

  const signAndFinish = async (
    embedSignature: (text: string, pos: any) => Promise<string>
  ) => {
    if (!document) return;
    setIsSigning(true);

    try {
      let signedPdf = document.fileData;

      if (signaturePlaced && document.fileData) {
        signedPdf = await embedSignature(fullName, signaturePosition);
      }

      await apiClient.signDocument(params.id as string, {
        signedAt: new Date().toISOString(),
        signature: fullName,
        initials,
        signaturePositionX: signaturePosition.x,
        signaturePositionY: signaturePosition.y,
        fileData: signedPdf || undefined,
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Sign error:", err);
    } finally {
      setIsSigning(false);
    }
  };

  return {
    document,
    isLoading,
    showSignatureModal,
    setShowSignatureModal,

    fullName,
    setFullName,
    initials,
    setInitials,

    signaturePlaced,
    setSignaturePlaced,
    signaturePosition,
    setSignaturePosition,

    adoptSignature,
    signAndFinish,
    isSigning,
  };
}
