// Run this file directly using ts-node
// Usage: npx ts-node server/test-email-script.ts

import dotenv from 'dotenv';
dotenv.config(); // Load your .env file

import { sendOrderConfirmationEmail } from "./utils/email.js";

async function testEmail() {
    console.log("=== Testing Email Configuration ===");
    console.log("RESEND_API_KEY present?", !!process.env.RESEND_API_KEY);

    if (!process.env.RESEND_API_KEY) {
        console.error("❌ RESEND_API_KEY is missing in .env file!");
        process.exit(1);
    }

    console.log("\nAttempting to send test email...\n");

    try {
        const emailSent = await sendOrderConfirmationEmail({
            customerEmail: "info@atrinwebdev.com", // <--- PUT YOUR EMAIL HERE
            customerName: "Atrin Test",
            orderNumber: "TEST-00123",
            orderDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            items: [
                {
                    name: "Test Sticker Pack",
                    quantity: 5,
                    price: 1.00,
                    options: [
                        { option_id: "size", option_value: "3x3" },
                        { option_id: "finish", option_value: "Glossy" }
                    ]
                }
            ],
            subtotal: 5.00,
            tax: 0.50,
            shipping: 3.99,
            discount: 0,
            total: 9.49,
            estimatedDelivery: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
            orderLink: "http://localhost:5173/order-history",
            shippingAddress: {
                firstName: "Atrin",
                lastName: "Test",
                street: "123 Test Street",
                city: "Austin",
                state: "TX",
                postalCode: "78701",
                country: "US"
            }
        });

        if (emailSent) {
            console.log("✅ Email sent successfully!");
            console.log("📧 Check your inbox (and spam folder) for the test email.");
        } else {
            console.error("❌ Email failed to send (returned false)");
        }
    } catch (error) {
        console.error("❌ Email Failed with error:");
        console.error(error);

        if (error instanceof Error) {
            console.error("\nError message:", error.message);
            console.error("Error stack:", error.stack);
        }
    }

    console.log("\n=== Test Complete ===");
}

testEmail();
