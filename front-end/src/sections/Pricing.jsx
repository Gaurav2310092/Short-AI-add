import { useThemeContext } from "../context/ThemeContext";
import SectionTitle from "../components/SectionTitle";
import { PricingTable } from "@clerk/clerk-react";

export default function Pricing() {
    const { theme } = useThemeContext();
    return (
        <div className="relative">
            <img className="absolute -mt-20 md:-mt-100 md:left-20 pointer-events-none" src={theme === "dark" ? "/assets/color-splash.svg" : "/assets/color-splash-light.svg"} alt="color-splash" width={1000} height={1000} priority fetchPriority="high" />
            <SectionTitle text1="PRICING" text2="Pricing Plans" text3="Our Pricing Plans are simple, transparent and flexible. Choose the plan that  suits your needs."/>

            <div className="flex flex-wrap items-center justify-center max-w-5xl mx-auto mt-20">
                <PricingTable appearance={{
                    variables:{
                        colorBackground:'none'
                    },
                    elements:{
                        pricingTableCardBody:'bg-white/6',
                        pricingTableCardHeader:'bg-white/10',
                        switchThumb:'bg-white'
                    }
                }}/>
            </div>
        </div>
    );
}