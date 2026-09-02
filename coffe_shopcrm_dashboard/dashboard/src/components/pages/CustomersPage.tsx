"use client";

import { useMemo } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { customerMix, geography, loyaltyStats } from "@/lib/analytics";
import { Card, CardHeader, PageHeader, PageSkeleton } from "../ui";
import CustomerMixChart from "../CustomerMixChart";
import LoyaltyScorecard from "../LoyaltyScorecard";
import GeographyPanel from "../GeographyPanel";

export default function CustomersPage() {
  const { ready, orders, meta, custCount } = useDashboard();

  const loyalty = useMemo(() => loyaltyStats(orders, meta), [orders, meta]);
  const mix = useMemo(() => customerMix(orders, custCount), [orders, custCount]);
  const geo = useMemo(() => geography(orders, meta), [orders, meta]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
      <PageHeader
        title="Customers"
        description="Segmentation, loyalty, and geographic concentration"
      />

      {!ready ? (
        <PageSkeleton tiles={3} />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader title="Customer mix" />
            <CustomerMixChart oneTime={mix.oneTime} repeat={mix.repeat} dormant={mix.dormant} />
          </Card>
          <Card>
            <CardHeader title="Loyalty scorecard" />
            <LoyaltyScorecard
              memberAOV={loyalty.memberAOV}
              nonAOV={loyalty.nonAOV}
              memberFreq={loyalty.memberFreq}
              nonFreq={loyalty.nonFreq}
              signupRate={loyalty.signupRate}
            />
          </Card>
          <Card>
            <CardHeader title="Geography" hint="concentration risk" />
            <GeographyPanel countries={geo.countries} usCities={geo.usCities} topShare={geo.topShare} />
          </Card>
        </div>
      )}
    </div>
  );
}
