import { CheckIcon } from "lucide-react";

export const pricingData = [
    {
        title: "Starter",
        price: 10,
        features: [
            {
                name: "25 Credits",
                icon: CheckIcon,
            },
            {
                name: "Stadard Quality",
                icon: CheckIcon,
            },
            {
                name: "No Wateramark",
                icon: CheckIcon,
            },
            {
                name: "Slower Generation Speed",
                icon: CheckIcon,
            },
            {
                name: "Email Support",
                icon: CheckIcon,
            },
        ],
        buttonText: "Get Started",
    },
    {
        title: "Pro Plan",
        price: 29,
        mostPopular: true,
        features: [
            {
                name: "80 Credits",
                icon: CheckIcon,
            },
            {
                name: "HD Quality",
                icon: CheckIcon,
            },
            {
                name: "No Watermark",
                icon: CheckIcon,
            },
            {
                name: "Video Generation",
                icon: CheckIcon,
            },
            {
                name: "Priority support",
                icon: CheckIcon,
            },
            {
                name: "Premium Code Review",
                icon: CheckIcon,
            }
        ],
        buttonText: "Upgarde Now",
    },
    {
        title: "Ultra Plan",
        price: 99,
        features: [
            {
                name: "300 Credits",
                icon: CheckIcon,
            },
            {
                name: "FHD Quality",
                icon: CheckIcon,
            },
            {
                name: "24/7 Dedicated Support",
                icon: CheckIcon,
            },
            {
                name: "Custom Integrations",
                icon: CheckIcon,
            },
            {
                name: "Fast Generation Speed",
                icon: CheckIcon,
            }
        ],
        buttonText: "Buy Now",
    }
];