import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { LanguageProvider } from "./language-provider"
import { ReportDistribution } from "./report-distribution"

describe("ReportDistribution", () => {
  it("renders a textual amount and share for every pie-chart segment", () => {
    const markup = renderToStaticMarkup(
      <LanguageProvider>
        <ReportDistribution
          title="Income sources"
          description="Where your money comes from."
          empty="No income data"
          data={[
            { name: "Salary", value: 750000, color: "#0f766e" },
            { name: "Interest", value: 250000, color: "#2563eb" },
          ]}
        />
      </LanguageProvider>,
    )

    expect(markup).toContain("Salary")
    expect(markup).toContain("Interest")
    expect(markup).toContain("750,000")
    expect(markup).toContain("250,000")
    expect(markup).toContain("75%")
    expect(markup).toContain("25%")
    expect(markup).toContain("Share")
  })
})
