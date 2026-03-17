import type { AtPoint, SvgTemplate } from "./types";
import { getFilename } from "./utils";


export class TemplatesHandler {
  private templatesDirectory: string;
  private templates: SvgTemplate[] = [];

  constructor(templatesDirectory: string) {
    this.templatesDirectory = templatesDirectory;
    this.crawlTemplatesDirectory();
  }

  private crawlTemplatesDirectory() {
    // since import.meta.glob is supposed to contain a static value (not a variable), we must filter down from a broader ./asset/** directory
    const svgs = import.meta.glob('./assets/**/*.svg', { eager: true, query: '?raw' });

    // filter every path that doesnt satisfy the templates directory & format them with useful metadata
    this.templates = Object.entries(svgs)
      .filter(([path]) => path.startsWith(this.templatesDirectory))
      .map(([path, data]) => {
        const name = getFilename(path);
        if (!name) return null;
        return {
          name,
          path,
          data: (data as any).default as string,
        };
      })
      .filter((t): t is SvgTemplate => !!t);
  }

  public renderTemplates(container: Element, svgWidth: number, svgHeight: number) {
    const parser = new DOMParser();

    for (const template of this.templates) {
      const svgElement = parser.parseFromString(template.data, 'image/svg+xml').documentElement;

      //* set name, size, color and remove default styles
      svgElement.id = template.name;

      svgElement.setAttribute('width', `${svgWidth}px`);
      svgElement.setAttribute('height', `${svgHeight}px`);

      svgElement.setAttribute('fill', 'currentColor'); // inherit parent div
      svgElement.setAttribute('stroke', 'currentColor'); // inherit parent div

      // clean up hardcoded colors
      svgElement.removeAttribute('style');
      svgElement.querySelectorAll('[fill]').forEach(el => el.setAttribute('fill', 'currentColor'));

      //* insert svg into provided container
      const importedSVG = document.importNode(svgElement, true);
      container.appendChild(importedSVG);
    }

    //* return a record of 'svg names -> atPoint function'
    return this.compileAtPointFunctions(container);
  }

  private compileAtPointFunctions(container: Element) {
    const svgs = container.querySelectorAll('svg');

    const shapeAtPoint: Record<string, AtPoint> = {};
    for (const svgElement of svgs) {
      const name = svgElement.id;
      const pathElement = svgElement.querySelector('path');
      if (!pathElement) {
        console.error(`Skipped AtPoint compilation of ${name} svg.`);
        continue;
      }

      const length = pathElement.getTotalLength();
      shapeAtPoint[name] = (atPoint: number) => pathElement.getPointAtLength(atPoint * length);
    }

    return shapeAtPoint;
  }
}
