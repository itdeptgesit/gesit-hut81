import RegistrationForm from "@/components/RegistrationForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-32 px-4 md:px-8 relative z-10">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-navy/5 to-transparent -z-10"></div>
        
        <RegistrationForm />
      </div>

      <Footer />
    </main>
  );
}
