"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/apiClient";
import { Document } from "@/types";

export default function SignDocumentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTab, setSignatureTab] = useState("style");
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [signaturePlaced, setSignaturePlaced] = useState(false);
  const [showFinishPrompt, setShowFinishPrompt] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

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
  }, [user, params.id]);

  const loadDocument = async () => {
    if (!params.id) {
      console.error("No document ID provided");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Loading document:", params.id);

      // Fetch the specific document by ID
      const doc = await apiClient.getDocumentById(params.id as string);

      console.log("Document loaded:", {
        id: doc.id,
        title: doc.title,
        hasFileData: !!doc.fileData,
        fileDataLength: doc.fileData?.length,
        fileType: doc.fileType,
        status: doc.status,
      });

      setDocument(doc);

      // Check if user is the recipient
      if (user && doc.recipientId !== user.id) {
        console.warn("User is not the recipient of this document");
        // You can redirect or show a message here if needed
      }

      // If already signed, mark signature as placed
      if (doc.status === "SIGNED") {
        setSignaturePlaced(true);
      }
    } catch (error) {
      console.error("Failed to load document:", error);
      alert(
        `Failed to load document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdoptSignature = () => {
    setShowSignatureModal(false);
    setSignaturePlaced(true);
  };

  const handleFinish = async () => {
    if (!document) return;

    setIsSigning(true);
    try {
      await apiClient.signDocument(params.id as string, {
        signedAt: new Date().toISOString(),
        signature: fullName,
        initials: initials,
      });

      // Show success message
      alert("Document signed successfully!");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to sign:", error);
      alert("Failed to sign document. Please try again.");
    } finally {
      setIsSigning(false);
    }
  };

  const renderDocumentContent = () => {
    if (!document) return null;

    // Handle PDF files with fileData (base64)
    if (document.fileData && document.fileType === "application/pdf") {
      return (
        <div className="w-full h-full">
          <iframe
            src={document.fileData}
            className="w-full min-h-[1000px] border-0"
            title={document.fileName || "Document Preview"}
          />
        </div>
      );
    }

    // Fallback: Show message if no file data
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No document preview available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {document.fileName || "Document content not loaded"}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading document...</div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Document not found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            The document you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isAlreadySigned = document.status === "SIGNED";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-[#1a1464] text-white px-6 py-3 flex items-center justify-between">
        <div className="text-sm">
          {isAlreadySigned
            ? "This document has been signed"
            : "Drag and drop fields from the left panel onto the document"}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleFinish}
            disabled={!signaturePlaced || isAlreadySigned || isSigning}
            className="px-6 py-2 bg-white text-purple-900 rounded-md font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigning ? "Signing..." : "Finish"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-purple-800 rounded"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Document Info Panel */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">
              DOCUMENT INFO
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Status
              </label>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    document.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : document.status === "SIGNED"
                      ? "bg-green-100 text-green-800"
                      : document.status === "DECLINED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {document.status}
                </span>
              </div>
            </div>

            {/* Sender Info */}
            {document.sender && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Sent By
                </label>
                <div className="mt-1">
                  <div className="text-sm font-medium text-gray-900">
                    {document.sender.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {document.sender.email}
                  </div>
                </div>
              </div>
            )}

            {/* Recipient Info */}
            {document.recipient && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Recipient
                </label>
                <div className="mt-1">
                  <div className="text-sm font-medium text-gray-900">
                    {document.recipient.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {document.recipient.email}
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Requested At
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {new Date(document.requestedAt).toLocaleString()}
              </div>
            </div>

            {document.signedAt && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Signed At
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {new Date(document.signedAt).toLocaleString()}
                </div>
              </div>
            )}

            {/* File Info */}
            {document.fileName && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  File Details
                </label>
                <div className="mt-1 space-y-1">
                  <div className="text-sm text-gray-900">
                    {document.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {document.fileType}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Fields Panel */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">FIELDS</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <button
              onClick={() => !isAlreadySigned && setShowSignatureModal(true)}
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span>Signature</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 border-2 border-gray-700 rounded flex items-center justify-center">
                <span className="text-xs font-bold">DS</span>
              </div>
              <span>Initial</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Date Signed</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Name</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Email Address</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              <span>Text</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 border-2 border-gray-700 rounded flex items-center justify-center">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>Checkbox</span>
            </button>
          </div>
        </aside>

        {/* Document Viewer */}
        <main className="flex-1 overflow-auto bg-gray-200 p-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[1000px] relative">
            {/* Document Title Header */}
            {document.title && (
              <div className="bg-gray-50 border-b border-gray-200 px-8 py-4">
                <h1 className="text-xl font-semibold text-gray-800">
                  {document.title}
                </h1>
                <div className="text-xs text-gray-500 mt-1">
                  Document ID: {document.id}
                  {document.sender && (
                    <span className="ml-4">
                      Sent by: {document.sender.name} ({document.sender.email})
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="p-12">
              {renderDocumentContent()}

              {/* Signature Placement */}
              {signaturePlaced && (
                <div
                  className="absolute"
                  style={{ top: "300px", left: "200px" }}
                >
                  <div className="bg-red-50 border-2 border-red-300 rounded p-2 relative">
                    <div className="font-['Brush_Script_MT',cursive] text-lg">
                      {fullName}
                    </div>
                    {!isAlreadySigned && (
                      <button
                        onClick={() => setSignaturePlaced(false)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Tools Sidebar */}
        <aside className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          </button>
        </aside>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Adopt Your Signature</h2>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Confirm your name, initials, and signature.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Initials <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex space-x-6 border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setSignatureTab("style")}
                    className={`pb-2 px-1 ${
                      signatureTab === "style"
                        ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    SELECT STYLE
                  </button>
                  <button
                    onClick={() => setSignatureTab("draw")}
                    className={`pb-2 px-1 ${
                      signatureTab === "draw"
                        ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    DRAW
                  </button>
                  <button
                    onClick={() => setSignatureTab("upload")}
                    className={`pb-2 px-1 ${
                      signatureTab === "upload"
                        ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    UPLOAD
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">PREVIEW</span>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Change Style
                    </button>
                  </div>
                  <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-start space-x-8">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          Signed by:
                        </div>
                        <div className="font-['Brush_Script_MT',cursive] text-2xl">
                          {fullName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {document.id.substring(0, 20)}...
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">DS</div>
                        <div className="text-xl font-semibold">{initials}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-6">
                By selecting Adopt and Sign, I agree that this mark will be the
                electronic representation of my signature or initials whenever I
                use it. I also understand that recipients of electronic
                documents I sign will be able to see my Docusign ID, which will
                include my email address.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdoptSignature}
                  className="px-6 py-3 bg-[#1a1464] text-white font-medium rounded-md hover:bg-[#14104d]"
                >
                  Adopt and Sign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish Prompt */}
      {showFinishPrompt && !isAlreadySigned && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl rounded-lg p-6 max-w-md border border-gray-200 z-50">
          <h3 className="text-lg font-semibold mb-2">Ready to Finish?</h3>
          <p className="text-sm text-gray-600 mb-4">
            You've completed the required fields. Review your work, then select
            Finish.
          </p>
          <button
            onClick={handleFinish}
            disabled={isSigning}
            className="w-full py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigning ? "Signing..." : "Finish"}
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 px-6">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span>Powered by</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-sm"></div>
              <span className="font-semibold">docusign</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button>English (US) ▼</button>
            <a href="#" className="hover:text-gray-900">
              Terms of Use
            </a>
            <a href="#" className="hover:text-gray-900">
              Privacy
            </a>
          </div>
          <div>
            <span>Copyright © 2025 Docusign, Inc. All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
