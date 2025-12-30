import React from 'react';

interface ProofEmailProps {
  customerName: string;
  orderId: number;
  proofDescription: string;
  proofFileUrl?: string;
  approvalLink: string;
  revisionLink: string;
}

export function ProofEmail({
  customerName,
  orderId,
  proofDescription,
  proofFileUrl,
  approvalLink,
  revisionLink,
}: ProofEmailProps) {
  return (
    <div
      style={{
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9fafb',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '30px',
          borderRadius: '8px 8px 0 0',
          borderBottom: '2px solid #3b82f6',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            margin: '0 0 10px 0',
            color: '#1f2937',
            fontSize: '28px',
            fontWeight: 'bold',
          }}
        >
          🎨 Your Design Proof is Ready
        </h1>
        <p
          style={{
            margin: '5px 0 0 0',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          Review your design and let us know what you think
        </p>
      </div>

      {/* Main Content */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '30px',
          marginBottom: '20px',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <p
          style={{
            margin: '0 0 20px 0',
            color: '#374151',
            fontSize: '16px',
            lineHeight: '1.6',
          }}
        >
          Hi <strong>{customerName}</strong>,
        </p>

        <p
          style={{
            margin: '0 0 20px 0',
            color: '#374151',
            fontSize: '16px',
            lineHeight: '1.6',
          }}
        >
          Great news! Your design proof for <strong>Order #{orderId}</strong> is ready for review.
        </p>

        {/* Proof Description */}
        <div
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              margin: '0 0 10px 0',
              color: '#1e40af',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Proof Details:
          </p>
          <p
            style={{
              margin: '0',
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
            }}
          >
            {proofDescription}
          </p>
        </div>

        {/* Preview Image */}
        {proofFileUrl && (
          <div
            style={{
              marginBottom: '20px',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
            }}
          >
            <img
              src={proofFileUrl}
              alt="Design Proof"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Call to Action Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px',
          }}
        >
          <a
            href={approvalLink}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✓ Approve This Design
          </a>
          <a
            href={revisionLink}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✎ Request Changes
          </a>
        </div>

        <p
          style={{
            margin: '20px 0 0 0',
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          If you have any questions about this design, please reply to this email and our team will get back to you as soon as possible.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '20px',
          color: '#6b7280',
          fontSize: '12px',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <p style={{ margin: '0 0 10px 0' }}>
          © 2024 Sticky Slap. All rights reserved.
        </p>
        <p style={{ margin: '0' }}>
          This is an automated message. Please do not reply to this email address directly.
        </p>
      </div>
    </div>
  );
}
