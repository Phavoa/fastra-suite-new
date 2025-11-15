import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import React from "react";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex w-full min-h-screen border">
      <div
        className="flex-1"
        style={{
          backgroundImage: "url('/images/bg.svg')",
        }}
        aria-hidden="true"
      >
        <div className="min-h-screen relative flex flex-col p-6 md:p-12 lg:pl-20 ">
          {/* Brand */}
          <div className="flex items-center gap-3 w-25 h-10 mb-8">
            {/* stylized mark */}
            <Image
              src="/images/fastra-logo.png"
              alt="Fastra"
              width={1000}
              height={1000}
              className="object-fill w-full h-auto"
            />
          </div>

          {/* Hero heading */}
          <div className="mb-12 max-w-lg space-y-4">
            <h1
              className="font-[Inter] text-2xl leading-tight font-bold text-gray-900 "
              style={{ lineHeight: 1.12 }}
            >
              Maximize the Planning of Projects with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B7CED] to-[#2143a9]">
                Fastra Suite
              </span>
            </h1>

            <p className="text-sm text-gray-600 max-w-md -mt-2">
              Scale Without Limits: Automate, Integrate, and Secure Your Project
              Operations
            </p>

            <Button
              variant="default"
              className="cursor-pointer transition-shadow text-xs"
            >
              <span className="text-xs">Contact Us</span>
            </Button>
          </div>

          {/* Simulated product table / dashboard small card */}
          <Card className="max-w-[720px] shadow-sm border border-gray-100">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-700">
                  Purchase
                </div>
                <div className="text-xs text-gray-400">Home / Purchase</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center py-2 border-y border-gray-100">
                <div>
                  <div className="text-xs text-gray-400">Draft</div>
                  <div className="text-lg font-semibold text-sky-600">12</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Approved</div>
                  <div className="text-lg font-semibold text-green-500">12</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Pending</div>
                  <div className="text-lg font-semibold text-yellow-500">
                    12
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                <table className="w-full text-left text-[13px]">
                  <thead className="text-gray-600">
                    <tr>
                      <th className="py-2">Request ID</th>
                      <th className="py-2">Product Name</th>
                      <th className="py-2">QTY</th>
                      <th className="py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr
                        key={i}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2">PR000{i + 1}</td>
                        <td className="py-2">Laptop, Keyboard & Mouse</td>
                        <td className="py-2">4</td>
                        <td className="py-2">2,600,000</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="flex-1 border">{children}</div>
    </div>
  );
};

export default AuthLayout;
