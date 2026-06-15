import { demoProjects } from "../utils/demoProjects";
import { getMockRoast, isDemoAnalysis } from "../services/mockRoast";
import { emptyRoastInput } from "../types/roast";
import { makeInput } from "./testUtils";

describe("mockRoast", () => {
  it("does not replace a user project with DayPilot", () => {
    const result = getMockRoast(makeInput({ projectName: "PetCoach", source: "user" }));
    const serialized = JSON.stringify(result);

    expect(result.projectName).toBe("PetCoach");
    expect(serialized).toContain("PetCoach");
    expect(serialized).not.toContain("DayPilot");
  });

  it("allows demo project names only when source is demo", () => {
    const result = getMockRoast(demoProjects[0].input);

    expect(result.projectName).toBe("DayPilot");
    expect(isDemoAnalysis(result)).toBe(true);
  });

  it("uses unnamed fallback for empty input", () => {
    const result = getMockRoast({ ...emptyRoastInput, source: "user" });

    expect(result.projectName).toBe("Проект без названия");
  });

  it("gives weak input lower confidence than strong input", () => {
    const weak = getMockRoast({ ...emptyRoastInput, source: "user" });
    const strong = getMockRoast(makeInput({ screenshotBase64: "data:image/png;base64,abc" }));

    expect(weak.confidence ?? 0).toBeLessThan(strong.confidence ?? 100);
  });
});
