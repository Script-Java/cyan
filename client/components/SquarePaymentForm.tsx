import { useEffect, useRef } from "react";

interface SquarePaymentFormProps {
  amount: number;
  orderId: number;
  customerEmail: string;
  customerName: string;
  onPaymentSuccess: (token: string) => void;
  isLoading?: boolean;
  applicationId?: string;
}

export default function SquarePaymentForm({
  amount,
  orderId,
  customerEmail,
  customerName,
  onPaymentSuccess,
  isLoading = false,
  applicationId,
}: SquarePaymentFormProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const statusContainerRef = useRef<HTMLDivElement>(null);
  const cardButtonRef = useRef<HTMLButtonElement>(null);
  const initializeRef = useRef(false);

  useEffect(() => {
    if (initializeRef.current) return;
    initializeRef.current = true;

    const initPayments = async () => {
      try {
        if (!(window as any).Square) {
          console.error("Square SDK not loaded");
          return;
        }

        const payments = (window as any).Square.payments(
          'sandbox-sq0idb-RT3u-HhCpNdbMiGg5aXuVg',
          'TC4Z3ZEBKRXRH'
        );
        
        const card = await payments.card();
        await card.attach('#card-container');

        const cardButton = cardButtonRef.current;
        if (cardButton) {
          cardButton.addEventListener('click', async () => {
            const statusContainer = statusContainerRef.current;

            try {
              const result = await card.tokenize();
              if (result.status === 'OK') {
                console.log(`Payment token is ${result.token}`);
                
                if (statusContainer) {
                  statusContainer.innerHTML = "Payment Successful";
                }

                // Send token to backend for payment processing
                const response = await fetch("/api/square/process-payment", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    token: result.token,
                    orderId: orderId,
                    amount: amount,
                    customerEmail: customerEmail,
                    customerName: customerName,
                  }),
                });

                const paymentResult = await response.json();

                if (!response.ok) {
                  throw new Error(paymentResult.error || "Payment failed");
                }

                onPaymentSuccess(result.token);
              } else {
                let errorMessage = `Tokenization failed with status: ${result.status}`;
                if (result.errors) {
                  errorMessage += ` and errors: ${JSON.stringify(
                    result.errors
                  )}`;
                }

                throw new Error(errorMessage);
              }
            } catch (e) {
              console.error(e);
              if (statusContainer) {
                statusContainer.innerHTML = "Payment Failed";
              }
            }
          });
        }
      } catch (error) {
        console.error("Failed to initialize Square payments:", error);
      }
    };

    initPayments();
  }, [amount, orderId, customerEmail, customerName, onPaymentSuccess]);

  return (
    <div id="payment-form" className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-2">Payment Details</h3>
          <p className="text-white/60 text-sm">
            Amount: ${(amount / 100).toFixed(2)}
          </p>
        </div>

        <div
          id="payment-status-container"
          ref={statusContainerRef}
          className="mb-4 text-sm font-medium"
        />

        <div
          id="card-container"
          ref={cardContainerRef}
          className="mb-6 p-4 bg-black/30 rounded-lg border border-white/10"
        />

        <button
          id="card-button"
          ref={cardButtonRef}
          type="button"
          disabled={isLoading}
          className="w-full bg-[#FFD713] hover:bg-[#FFD713]/90 text-black font-bold py-3 rounded-lg transition-all disabled:opacity-50"
        >
          Pay ${(amount / 100).toFixed(2)}
        </button>

        <p className="text-xs text-white/40 text-center mt-4">
          Secure payment powered by Square
        </p>
      </div>
    </div>
  );
}
