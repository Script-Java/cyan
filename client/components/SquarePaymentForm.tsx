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
  const initializeRef = useRef(false);

  useEffect(() => {
    if (initializeRef.current) return;

    const initializePayments = async () => {
      try {
        // Wait for Square SDK to be loaded
        let attempts = 0;
        while (!(window as any).Square && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 50));
          attempts++;
        }

        if (!(window as any).Square) {
          console.error("Square SDK not loaded after timeout");
          return;
        }

        console.log("Square SDK loaded successfully");
        initializeRef.current = true;

        const appId = 'sq0idp-aI75bRHWpnYqioPYqvKvsw';
        const locationId = 'M22XGM76XXKXW';

        const payments = (window as any).Square.payments(appId, locationId);

        console.log("Square payments object created");

        const card = await payments.card();
        console.log("Card object created");

        await card.attach('#card-container');
        console.log("Card attached to container");

        const cardButton = document.getElementById('card-button');
        if (cardButton) {
          cardButton.addEventListener('click', async () => {
            const statusContainer = document.getElementById('payment-status-container');

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

    initializePayments();
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
          className="mb-4 text-sm font-medium text-white"
        />

        <div
          id="card-container"
          className="mb-6 p-4 bg-black/30 rounded-lg border border-white/10 min-h-14"
        />

        <button
          id="card-button"
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
