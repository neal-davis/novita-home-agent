import { NOVITA_URL } from "@/constants/urls";
import { transformModelIdToPath } from "@/lib/utils";
import { ModelType } from "@/types/models";
import type { AnyModel } from "./capabilities";

export type ModelActionLinks = {
  detailsHref: string | null;
  playgroundHref: string | null;
};

export type DisplayModelAction = {
  href: string;
  label: "More" | "Playground";
  kind: "details" | "playground";
};

function isPlaygroundLikeHref(href: string): boolean {
  return (
    href.includes("/llm-playground") || href.includes("/multimodal-playground")
  );
}

function isLegacyStaticPlaygroundHref(href: string): boolean {
  return /^\/models\/(image|audio|video)#.+/.test(href);
}

export function getModelActionLinks(model: AnyModel): ModelActionLinks {
  const linkPath =
    "linkPath" in model && model.linkPath
      ? model.linkPath
      : typeof model.id === "string"
        ? transformModelIdToPath(model.id)
        : null;

  const detailsHref =
    model.type === ModelType.Chat ||
    model.type === ModelType.Embedding ||
    model.type === ModelType.Reranker ||
    model.type === ModelType.Vision
      ? linkPath
        ? `${NOVITA_URL.MODEL_API_CONSOLE_MODEL_DETAIL}/${linkPath}`
        : null
      : null;

  if (model.type === ModelType.Chat && typeof model.id === "string") {
    return {
      detailsHref,
      playgroundHref: `${NOVITA_URL.LLM_CONSOLE_PLAYGROUND}?model=${transformModelIdToPath(model.id)}`,
    };
  }

  if (
    model.type === ModelType.Images ||
    model.type === ModelType.Audio ||
    model.type === ModelType.Video ||
    model.type === ModelType.AISearch
  ) {
    return {
      detailsHref: model.link ?? detailsHref,
      playgroundHref:
        model.link ?? `${NOVITA_URL.MODEL_API_CONSOLE_IMAGE_PLAYGROUND}`,
    };
  }

  return {
    detailsHref,
    playgroundHref: detailsHref,
  };
}

export function getDisplayModelActions(
  links: ModelActionLinks,
): DisplayModelAction[] {
  const { detailsHref, playgroundHref } = links;

  if (playgroundHref && !detailsHref && isPlaygroundLikeHref(playgroundHref)) {
    return [
      {
        href: playgroundHref,
        label: "Playground",
        kind: "playground",
      },
    ];
  }

  if (detailsHref && playgroundHref && detailsHref === playgroundHref) {
    if (
      isPlaygroundLikeHref(playgroundHref) ||
      isLegacyStaticPlaygroundHref(playgroundHref)
    ) {
      return [
        {
          href: playgroundHref,
          label: "Playground",
          kind: "playground",
        },
      ];
    }

    return [
      {
        href: detailsHref,
        label: "More",
        kind: "details",
      },
    ];
  }

  if (playgroundHref && !detailsHref) {
    return [
      {
        href: playgroundHref,
        label: "Playground",
        kind: "playground",
      },
    ];
  }

  if (detailsHref && !playgroundHref) {
    return [
      {
        href: detailsHref,
        label: "More",
        kind: "details",
      },
    ];
  }

  if (detailsHref && playgroundHref) {
    return [
      {
        href: detailsHref,
        label: "More",
        kind: "details",
      },
      {
        href: playgroundHref,
        label: "Playground",
        kind: "playground",
      },
    ];
  }

  return [];
}
