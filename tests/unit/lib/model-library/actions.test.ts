import {
  getDisplayModelActions,
  type ModelActionLinks,
} from "@/lib/model-library/actions";

describe("model-library actions", () => {
  it("shows only playground when only playground exists", () => {
    const actions = getDisplayModelActions({
      detailsHref: null,
      playgroundHref: "/models-console/llm-playground?model=test",
    });

    expect(actions).toEqual([
      {
        href: "/models-console/llm-playground?model=test",
        label: "Playground",
        kind: "playground",
      },
    ]);
  });

  it("shows only more when only details exists", () => {
    const actions = getDisplayModelActions({
      detailsHref: "/models-console/model-detail/test",
      playgroundHref: null,
    });

    expect(actions).toEqual([
      {
        href: "/models-console/model-detail/test",
        label: "More",
        kind: "details",
      },
    ]);
  });

  it("deduplicates identical details and playground links into a single playground action", () => {
    const sharedHref = "/models-console/multimodal-playground?model=test";
    const actions = getDisplayModelActions({
      detailsHref: sharedHref,
      playgroundHref: sharedHref,
    });

    expect(actions).toEqual([
      {
        href: sharedHref,
        label: "Playground",
        kind: "playground",
      },
    ]);
  });

  it("treats legacy static playground hashes as a single playground action", () => {
    const sharedHref = "/models/image#remove-text";
    const actions = getDisplayModelActions({
      detailsHref: sharedHref,
      playgroundHref: sharedHref,
    });

    expect(actions).toEqual([
      {
        href: sharedHref,
        label: "Playground",
        kind: "playground",
      },
    ]);
  });

  it("keeps a single more action when the duplicated link is not a playground route", () => {
    const sharedHref = "/models-console/model-detail/test";
    const actions = getDisplayModelActions({
      detailsHref: sharedHref,
      playgroundHref: sharedHref,
    });

    expect(actions).toEqual([
      {
        href: sharedHref,
        label: "More",
        kind: "details",
      },
    ]);
  });

  it("keeps both actions when links are different", () => {
    const actions = getDisplayModelActions({
      detailsHref: "/models-console/model-detail/test",
      playgroundHref: "/models-console/llm-playground?model=test",
    });

    expect(actions).toEqual([
      {
        href: "/models-console/model-detail/test",
        label: "More",
        kind: "details",
      },
      {
        href: "/models-console/llm-playground?model=test",
        label: "Playground",
        kind: "playground",
      },
    ]);
  });
});
