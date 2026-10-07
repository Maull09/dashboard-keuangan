"use client"

import Link from "next/link"
import { useLanguage } from "./language-provider"
import { PublicHeader } from "./public-header"
import { ReportDistribution } from "./report-distribution"
import { Button } from "./ui/button"

export function Landing() {
  const { t } = useLanguage()
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="grid items-center gap-12 py-12 md:grid-cols-[1.1fr_1fr] md:gap-16 md:py-20">
          <div>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
              {t("landingTitle")}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
              {t("landingDescription")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="min-h-12 bg-teal-700 text-white hover:bg-teal-800"
              >
                <Link href="/sign-up">{t("signUp")}</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="min-h-12">
                <a href="#features">{t("landingExplore")}</a>
              </Button>
            </div>
          </div>
          <ReportDistribution
            title={t("landingExample")}
            description={t("landingExampleNote")}
            empty={t("noData")}
            data={[
              { name: t("landingFood"), value: 1500000, color: "#0f766e" },
              { name: t("landingTransport"), value: 500000, color: "#475569" },
              { name: t("landingBills"), value: 1000000, color: "#b45309" },
            ]}
          />
        </section>
        <section
          id="features"
          className="grid gap-8 border-t py-12 md:grid-cols-[1.1fr_1fr] md:gap-16"
        >
          <h2 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">
            {t("landingFeatures")}
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold">
                {t("landingRecordsTitle")}
              </h3>
              <p className="mt-2 leading-relaxed text-slate-600">
                {t("landingRecords")}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {t("landingPlansTitle")}
              </h3>
              <p className="mt-2 leading-relaxed text-slate-600">
                {t("landingPlans")}
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto max-w-6xl border-t px-5 py-6 text-sm text-slate-600 sm:px-8">
        {t("landingFooter")}
      </footer>
    </div>
  )
}
