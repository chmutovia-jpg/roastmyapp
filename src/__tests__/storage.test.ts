import {
  addHistoryItem,
  deleteHistoryItem,
  HISTORY_KEY,
  loadHistory,
  loadProjectWorkspaces,
  saveProjectVersion,
  stripHeavyInputForHistory,
} from "../services/storage";
import type { RoastHistoryItem } from "../types/roast";
import { makeInput, makeResult } from "./testUtils";

const makeHistoryItem = (id: string): RoastHistoryItem => {
  const input = makeInput({
    projectName: `Project ${id}`,
    screenshotBase64: "data:image/png;base64,heavy",
  });

  return {
    id,
    createdAt: new Date().toISOString(),
    input: stripHeavyInputForHistory(input),
    originalInput: stripHeavyInputForHistory(input),
    result: makeResult(input),
    meta: {
      source: "mock",
      reason: "missing_api_key",
      createdAt: new Date().toISOString(),
    },
  };
};

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves, opens and deletes history items", () => {
    addHistoryItem(makeHistoryItem("1"));

    expect(loadHistory()).toHaveLength(1);
    expect(loadHistory()[0].result.projectName).toBe("Project 1");

    deleteHistoryItem("1");

    expect(loadHistory()).toHaveLength(0);
  });

  it("keeps maximum 20 history items", () => {
    for (let index = 0; index < 25; index += 1) {
      addHistoryItem(makeHistoryItem(String(index)));
    }

    expect(loadHistory()).toHaveLength(20);
  });

  it("does not crash on corrupted localStorage", () => {
    window.localStorage.setItem(HISTORY_KEY, "{broken");

    expect(loadHistory()).toEqual([]);
  });

  it("does not store screenshotBase64 in history", () => {
    addHistoryItem(makeHistoryItem("screenshot"));

    const raw = window.localStorage.getItem(HISTORY_KEY) || "";
    const history = loadHistory();

    expect(raw).not.toContain("data:image/png;base64,heavy");
    expect(history[0].input.screenshotBase64).toBeUndefined();
    expect(history[0].input.screenshotMeta?.removedFromHistory).toBe(true);
  });

  it("keeps old history readable after launchPack schema migration", () => {
    const input = makeInput({ projectName: "Legacy Project" });
    const { launchPack: _launchPack, ...legacyResult } = makeResult(input);
    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([
        {
          id: "legacy-1",
          createdAt: new Date().toISOString(),
          input: stripHeavyInputForHistory(input),
          result: legacyResult,
        },
      ]),
    );

    const history = loadHistory();

    expect(history).toHaveLength(1);
    expect(history[0].result.projectName).toBe("Legacy Project");
    expect(history[0].result.launchPack?.replyComments).toHaveLength(5);
  });

  it("new workspace storage works alongside legacy history", () => {
    const input = makeInput({ projectName: "Workspace Project" });
    saveProjectVersion({ input, result: makeResult(input) });

    expect(loadProjectWorkspaces()[0].projectName).toBe("Workspace Project");
  });
});
