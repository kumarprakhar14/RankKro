import { Navbar } from "../components/landing/Navbar"
import { Hero } from "../components/landing/Hero"
import { WhyExamEdge } from "@/components/landing/WhyExamEdge"
import { Testimonials } from "@/components/landing/Testimonials"
import { Footer } from "@/components/landing/Footer"

const Index = () => {
    return (
        <div className="w-full">
            <Navbar />
            <Hero />
            <WhyExamEdge />
            <Testimonials />
            <Footer />
        </div>
    )
}

export default Index