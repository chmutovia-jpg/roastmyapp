import {
  USER_PROFILE_KEY,
  clearUserProfile,
  createUserProfile,
  getUserProfile,
} from "../services/profile";

describe("profile", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates a local profile", () => {
    const profile = createUserProfile({
      email: "USER@Example.com",
      name: "Masha",
      acquisitionSource: "threads",
    });

    expect(profile.email).toBe("user@example.com");
    expect(profile.name).toBe("Masha");
    expect(getUserProfile()?.acquisitionSource).toBe("threads");
  });

  it("saves Other acquisition source", () => {
    createUserProfile({
      email: "user@example.com",
      acquisitionSource: "other",
      acquisitionSourceOther: "Product Hunt comment",
    });

    expect(getUserProfile()?.acquisitionSource).toBe("other");
    expect(getUserProfile()?.acquisitionSourceOther).toBe("Product Hunt comment");
  });

  it("does not crash on corrupted profile storage", () => {
    window.localStorage.setItem(USER_PROFILE_KEY, "{broken");

    expect(getUserProfile()).toBeNull();
  });

  it("clears local profile", () => {
    createUserProfile({ email: "user@example.com", acquisitionSource: "search" });
    clearUserProfile();

    expect(getUserProfile()).toBeNull();
  });
});
