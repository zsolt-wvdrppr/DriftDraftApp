"use client";

import { LuCheck, LuSparkles, LuFileText, LuArrowRight } from "react-icons/lu";
import Link from "next/link";

const Pricing = () => {
  const features = [
    {
      icon: <LuSparkles className="w-6 h-6 text-blue-500" />,
      title: "AI Suggestions",
      cost: "1 credit each",
      description: "Get marketing-aware guidance when answering questions",
      details: [
        "Click 'Refine with AI' for instant help",
        "Marketing perspective insights",
        "Strategic question guidance",
        "Prevent common pitfalls",
      ],
    },
    {
      icon: <LuFileText className="w-6 h-6 text-purple-500" />,
      title: "Plan Generation",
      cost: "5 credits each",
      description: "Complete website blueprint document generation",
      details: [
        "25+ page comprehensive document",
        "Psychological triggers analysis",
        "Marketing strategy recommendations",
        "Wireframe suggestions",
        "User journey mapping",
        "Development requirements",
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, Credit-Based Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Pay only for what you use. No monthly subscriptions, no hidden fees.
        </p>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get Started for Free
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Sign up today and receive free credits to try DriftDraft. Complete
            the questionnaire and explore our AI suggestions without any upfront
            cost.
          </p>
          <div className="flex flex-col gap-4 justify-center items-center">
            <Link href="/signup" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              Sign Up Free
              <LuArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-gray-500">
              View detailed pricing after logging in
            </p>
          </div>
        </div>
      </div>

      {/* How Credits Work */}
      <div className="mb-16 w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          How Credits Work
        </h2>
        <div className="flex flex-col gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {feature.cost}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-gray-50 rounded-xl p-8 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose Credit-Based Pricing?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our flexible approach means you only pay for the value you receive,
            when you need it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <LuCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Waste
            </h3>
            <p className="text-gray-600 text-sm">
              Only pay for what you actually use. No unused monthly fees.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <LuSparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Flexible
            </h3>
            <p className="text-gray-600 text-sm">
              Mix and match AI suggestions with full plan generations as needed.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <LuFileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Transparent
            </h3>
            <p className="text-gray-600 text-sm">
              Clear pricing with no hidden costs. You know exactly what you're
              paying for.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes! Sign up for free and receive credits to try DriftDraft. You
              can complete the questionnaire and get basic insights at no cost.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How do I view current pricing?
            </h3>
            <p className="text-gray-600 text-sm">
              Detailed pricing packages are available after you log in to your
              account. This allows us to show you personalised options.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Can I mix AI suggestions and plan generations?
            </h3>
            <p className="text-gray-600 text-sm">
              Absolutely! Use your credits however you need - 10 suggestions, 2
              plans, or any combination that works for you.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What's included in a plan generation?
            </h3>
            <p className="text-gray-600 text-sm">
              A comprehensive 25+ page document with wireframes, marketing
              strategies, psychological triggers, and development requirements.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Do credits expire?
            </h3>
            <p className="text-gray-600 text-sm">
              Credit expiry periods vary by package. You'll see the specific
              terms when viewing pricing options in your account.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What happens if I run out of credits?
            </h3>
            <p className="text-gray-600 text-sm">
              You can purchase additional credits at any time through your
              account dashboard. Your work is always saved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
