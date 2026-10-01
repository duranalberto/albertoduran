import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

type ContainerRenderOptions = Parameters<AstroContainer["renderToString"]>[1];

let container: Promise<AstroContainer> | undefined;

function getContainer(): Promise<AstroContainer> {
  container ??= AstroContainer.create();
  return container;
}

/** Render one `.astro` component to an HTML string with the shared container. */
export async function render(
  component: AstroComponentFactory,
  options: ContainerRenderOptions = {},
): Promise<string> {
  return (await getContainer()).renderToString(component, options);
}
