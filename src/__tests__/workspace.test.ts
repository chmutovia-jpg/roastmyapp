import {
  PROJECT_WORKSPACES_KEY,
  loadProjectWorkspaces,
  saveProjectVersion,
} from "../services/storage";
import { makeInput, makeResult } from "./testUtils";

const meta = {
  source: "mock" as const,
  reason: "missing_api_key" as const,
  createdAt: new Date().toISOString(),
};

describe("project workspaces", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves v1 and strips screenshotBase64", () => {
    const input = makeInput({ screenshotBase64: "data:image/png;base64,heavy" });
    const workspace = saveProjectVersion({
      input,
      result: makeResult(input),
      meta,
      userId: "user-1",
    });

    expect(workspace.versions).toHaveLength(1);
    expect(workspace.versions[0].version).toBe(1);
    expect(workspace.versions[0].input.screenshotBase64).toBeUndefined();
    expect(workspace.versions[0].input.screenshotMeta?.removedFromHistory).toBe(true);
    expect(window.localStorage.getItem(PROJECT_WORKSPACES_KEY)).not.toContain("data:image/png;base64,heavy");
  });

  it("saves v2 in the same workspace", () => {
    const input = makeInput();
    const v1 = saveProjectVersion({ input, result: makeResult(input), meta });
    const v2 = saveProjectVersion({
      workspaceId: v1.id,
      input,
      result: makeResult(input),
      meta,
      clarificationText: "AI неправильно понял аудиторию",
    });

    expect(v2.id).toBe(v1.id);
    expect(v2.versions).toHaveLength(2);
    expect(v2.versions[1].version).toBe(2);
    expect(v2.versions[1].clarificationText).toContain("аудиторию");
  });

  it("keeps maximum 10 versions per workspace", () => {
    const input = makeInput();
    let workspace = saveProjectVersion({ input, result: makeResult(input), meta });

    for (let index = 0; index < 14; index += 1) {
      workspace = saveProjectVersion({
        workspaceId: workspace.id,
        input,
        result: makeResult(input),
        meta,
      });
    }

    expect(workspace.versions).toHaveLength(10);
    expect(workspace.versions[0].version).toBe(6);
  });

  it("keeps maximum 20 workspaces", () => {
    for (let index = 0; index < 25; index += 1) {
      const input = makeInput({ projectName: `Project ${index}` });
      saveProjectVersion({ input, result: makeResult(input), meta });
    }

    expect(loadProjectWorkspaces()).toHaveLength(20);
  });
});
