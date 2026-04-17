import { Navbar } from "../components/landing/Navbar"
import { Hero } from "../components/landing/Hero"
import { WhyRankKro } from "@/components/landing/WhyRankKro"
import { Testimonials } from "@/components/landing/Testimonials"
import { Footer } from "@/components/landing/Footer"

const Index = () => {
    return (
        <div className="w-full">
            <Navbar />
            <Hero />
            <WhyRankKro />
            <Testimonials />
            <Footer />
        </div>
    )
}

export default Index