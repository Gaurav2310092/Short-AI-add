const { verifyWebhook } = require("@clerk/express/webhooks");
const { User } = require("../models/user");

const clerkwebHooks = async (req, res) => {
    try {

        console.log("👉 Webhook HIT");

        // 🔍 DEBUG START
        console.log("Headers:", req.headers);
        console.log("Body type:", typeof req.body);
        console.log("Raw body:", req.body);
        // 🔍 DEBUG END
        const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

        if (!signingSecret) {
            console.error("Missing CLERK_WEBHOOK_SIGNING_SECRET");
            return res.status(500).json({ message: "Server configuration error" });
        }

        // verifyWebhook handles the svix-id, timestamp, and signature headers for you
        // BUT it needs the raw body (req.body should be a Buffer/String)
        const evt = await verifyWebhook(req, {
            signingSecret: signingSecret
        });

        const { data, type } = evt;

        switch (type) {

            // USER CREATED
            case "user.created": {
                await User.findOneAndUpdate(
                    { clerkId: data.id },
                    {
                        $set: {                                              // ✅ Use $set
                            clerkId: data.id,
                            email: data?.email_addresses?.[0]?.email_address || "",
                            name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
                            image: data?.image_url || "",
                        },
                        $setOnInsert: { credits: 20 }                       // ✅ Credits only on NEW user
                    },
                    { upsert: true, new: true }
                );

                break;
            }

            // USER UPDATED
            case "user.updated": {
                if (!data?.id) break;

                await User.findOneAndUpdate(
                    { clerkId: data.id },
                    {
                        $set: {                                              // ✅ Use $set
                            email: data?.email_addresses?.[0]?.email_address || "",
                            name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
                            image: data?.image_url || ""
                        }
                    }
                );

                break;
            }

            // USER DELETED
            case "user.deleted": {
                if (!data?.id) break;
                await User.findOneAndDelete({ clerkId: data.id });
                break;
            }

            // PAYMENT UPDATED
            case "paymentAttempt.updated": {
                console.log("Payment event received");

                if (data?.status !== "paid") break;

                const credits = { pro: 80, premium: 240 };
                const clerkUserId = data?.payer?.user_id;
                const planId = data?.metadata?.plan || data?.plan || "pro";

                if (!credits[planId]) {
                    console.log("Invalid plan:", planId);
                    break;
                }

                await User.findOneAndUpdate(
                    { clerkId: clerkUserId },
                    { $inc: { credits: credits[planId] } }
                );

                console.log("Credits updated");
                break;
            }

            default:
                console.log("Unhandled webhook:", type);
        }

        res.json({ message: `Webhook Received: ${type}` });

    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { clerkwebHooks };