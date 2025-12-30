import { RequestHandler } from "express";
import { generateProofEmailHtml } from "../emails/generate-proof-email";

export const handleProofEmailPreview: RequestHandler = (req, res) => {
  const sampleHtml = generateProofEmailHtml({
    customerName: "John Doe",
    orderId: 12345,
    proofDescription: "Custom sticker design with your company logo and tagline.\n\nThe design features:\n- Vibrant color scheme\n- High-resolution graphics\n- Print-ready format\n\nPlease review and let us know if any changes are needed!",
    proofFileUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop",
    approvalLink: "https://example.com/proofs/preview123/approve",
    revisionLink: "https://example.com/proofs/preview123/request-revisions",
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(sampleHtml);
};
