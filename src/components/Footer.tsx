import { Link } from "react-router-dom";
import { Mail, MapPin, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/vinathaal_icon.png" alt="Vinathaal" className="w-8 h-8 object-contain" />
              <img src="/vinathaal-heading-white.png" alt="Vinathaal" className="h-6 object-contain" />
            </div>
            <p className="text-xs leading-relaxed text-gray-500 max-w-xs mb-4">
              AI-powered question paper generation for educators and institutions. Save hours, maintain quality.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors">
                <Twitter className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors">
                <Instagram className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors">
                <Linkedin className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-4">Product</h5>
            <ul className="space-y-2.5">
              {[
                { to: "/generator?mode=syllabus", label: "Syllabus Generator" },
                { to: "/generator?mode=questionbank", label: "Question Bank" },
                { to: "/mcq-generator", label: "MCQ Generator" },
                { to: "/templates", label: "Templates" },
                { to: "/pricing", label: "Pricing" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-xs text-gray-500 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-4">Company</h5>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/support", label: "Support" },
                { to: "/login", label: "Login" },
                { to: "/signup", label: "Sign Up" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-xs text-gray-500 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-4">Contact</h5>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <a href="mailto:azhizensolutions@gmail.com" className="text-xs text-gray-500 hover:text-white transition-colors break-all">
                  azhizensolutions@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  R-No 309, Mercury Block<br />
                  KSRCE, Tiruchengode<br />
                  Namakkal, Tamil Nadu
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Vinathaal by Azhizen Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/support" className="text-xs text-gray-600 hover:text-white transition-colors">Privacy</Link>
            <Link to="/support" className="text-xs text-gray-600 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
