import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Building2, Sparkles } from "lucide-react";

const PLANS_MONTHLY = [
  {
    name: "Free",
    price: { monthly: "₹0", annual: "₹0" },
    period: { monthly: "forever", annual: "forever" },
    desc: "Perfect for trying out Vinathaal",
    icon: Sparkles,
    iconBg: "bg-gray-50 dark:bg-gray-700/50",
    iconColor: "text-gray-500 dark:text-gray-400",
    features: [
      "5 question papers per month",
      "Basic templates",
      "PDF export",
      "Standard support",
    ],
    cta: "Current Plan",
    ctaStyle: "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800",
    popular: false,
  },
  {
    name: "Pro",
    price: { monthly: "₹299", annual: "₹199" },
    period: { monthly: "/ month", annual: "/ month" },
    desc: "For teachers and small institutions",
    icon: Zap,
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    features: [
      "Unlimited question papers",
      "Custom header upload",
      "PDF & Word export",
      "All templates",
      "Syllabus AI analysis",
      "Question bank access",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    ctaStyle: "bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white hover:opacity-90",
    popular: true,
  },
  {
    name: "Institution",
    price: { monthly: "₹999", annual: "₹699" },
    period: { monthly: "/ month", annual: "/ month" },
    desc: "For schools, colleges, and coaching centres",
    icon: Building2,
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    features: [
      "Everything in Pro",
      "Up to 50 user accounts",
      "Community dashboard",
      "Institution branding",
      "Usage analytics",
      "Bulk generation",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    ctaStyle: "border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 bg-transparent hover:bg-amber-50 dark:hover:bg-amber-900/20",
    popular: false,
  },
];

const COMPARISON_ROWS = [
  { feature: "Question papers / month", free: "5", pro: "Unlimited", inst: "Unlimited" },
  { feature: "Templates",               free: "Basic",  pro: "All",       inst: "All + Custom" },
  { feature: "PDF Export",              free: true,  pro: true,   inst: true },
  { feature: "Word Export",             free: false, pro: true,   inst: true },
  { feature: "Custom header upload",    free: false, pro: true,   inst: true },
  { feature: "Syllabus AI analysis",    free: false, pro: true,   inst: true },
  { feature: "Question bank access",    free: false, pro: true,   inst: true },
  { feature: "Answer key generation",   free: false, pro: true,   inst: true },
  { feature: "User accounts",           free: "1",   pro: "1",    inst: "Up to 50" },
  { feature: "Usage analytics",         free: false, pro: false,  inst: true },
  { feature: "API access",              free: false, pro: false,  inst: true },
  { feature: "Support",                 free: "Standard", pro: "Priority", inst: "Dedicated" },
];

const faqs = [
  { q: "Can I change plans anytime?",        a: "Yes — upgrades take effect immediately." },
  { q: "Is there a free trial for Pro?",     a: "14-day free trial available for Pro and Institution plans." },
  { q: "What payment methods do you accept?", a: "All major cards and UPI payments." },
  { q: "Do you offer educational discounts?", a: "Yes, contact us for institution pricing options." },
];

function CellValue({ val }: { val: string | boolean }) {
  if (typeof val === "boolean") {
    return val
      ? <Check className="w-4 h-4 text-emerald-500 mx-auto" />
      : <X className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />;
  }
  return <span className="text-xs text-gray-700 dark:text-gray-300">{val}</span>;
}

const Pricing = () => {
  const navigate   = useNavigate();
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-full p-6 md:p-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Plans & Pricing</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Simple pricing. Start free, upgrade when you need more.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="animate-fade-in-up delay-75 flex items-center justify-center gap-3">
        <span className={`text-xs font-medium transition-colors ${!annual ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual((a) => !a)}
          className={[
            "relative w-11 h-6 rounded-full transition-colors duration-300",
            annual ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700",
          ].join(" ")}
        >
          <span className={[
            "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300",
            annual ? "translate-x-5" : "translate-x-0",
          ].join(" ")} />
        </button>
        <span className={`text-xs font-medium transition-colors flex items-center gap-1.5 ${annual ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          Annual
          <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            Save ~33%
          </span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="animate-fade-in-up delay-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS_MONTHLY.map((plan) => {
          const Icon = plan.icon;
          return (
            <div key={plan.name}
              className={[
                "relative flex flex-col bg-white dark:bg-gray-800/60 border rounded-2xl p-5 transition-shadow",
                plan.popular
                  ? "border-blue-300 dark:border-blue-700 shadow-md shadow-blue-500/10"
                  : "border-gray-100 dark:border-gray-700",
              ].join(" ")}>

              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white text-[10px] font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`w-9 h-9 rounded-xl ${plan.iconBg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${plan.iconColor}`} />
              </div>

              <p className="text-sm font-bold text-gray-900 dark:text-white">{plan.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-3">{plan.desc}</p>

              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {annual ? plan.price.annual : plan.price.monthly}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                  {annual ? plan.period.annual : plan.period.monthly}
                </span>
                {annual && plan.name !== "Free" && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">billed annually</p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-10 text-sm font-semibold ${plan.ctaStyle}`}
                onClick={() => plan.name === "Institution" ? navigate("/support") : undefined}
              >
                {plan.cta}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div className="animate-fade-in-up delay-200">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Compare Plans</h2>
        <div className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">Feature</th>
                <th className="text-center text-xs font-semibold text-gray-700 dark:text-gray-300 px-4 py-3">Free</th>
                <th className="text-center text-xs font-semibold text-blue-700 dark:text-blue-400 px-4 py-3">Pro</th>
                <th className="text-center text-xs font-semibold text-amber-700 dark:text-amber-400 px-4 py-3">Institution</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={[
                    "border-b border-gray-50 dark:border-gray-700/50 last:border-0",
                    i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/30",
                  ].join(" ")}
                >
                  <td className="text-xs text-gray-600 dark:text-gray-400 px-4 py-2.5">{row.feature}</td>
                  <td className="text-center px-4 py-2.5"><CellValue val={row.free} /></td>
                  <td className="text-center px-4 py-2.5"><CellValue val={row.pro} /></td>
                  <td className="text-center px-4 py-2.5"><CellValue val={row.inst} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="animate-fade-in-up delay-300">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-800 dark:text-white mb-1">{q}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="animate-fade-in-up delay-400 rounded-2xl bg-gradient-to-r from-[#3F3D56] to-[#007AFF] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-white">
          <p className="font-semibold text-sm">Need a custom plan?</p>
          <p className="text-xs text-blue-200 mt-0.5">Contact us for volume pricing and custom integrations.</p>
        </div>
        <Button className="bg-white text-[#3F3D56] hover:bg-gray-50 text-xs font-semibold shrink-0 h-10"
          onClick={() => navigate("/support")}>
          Contact Sales
        </Button>
      </div>
    </div>
  );
};

export default Pricing;
