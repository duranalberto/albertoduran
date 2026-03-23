import { type Icon } from "@appTypes/icon";
import fs from "node:fs";
import path from "node:path";

const get_content_from_file = (fileName: string): string => {
  try {
    const directoryPath = path.join(process.cwd(), "src", "assets", "icons");
    const filePath = path.join(directoryPath, `${fileName}.svg`);

    const svgString = fs.readFileSync(filePath, "utf-8");

    const match = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);

    return match?.[1]?.trim() ?? "";
  } catch (error) {
    console.error(`Could not read SVG file: ${fileName}.svg`, error);
    return "";
  }
};

export const skills: Record<string, Icon> = {
  js: {
    text: "JavaScript",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`js`),
    isFile: true,
  },
  react: {
    text: "React",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`react`),
    isFile: true,
  },
  astro: {
    text: "Astro",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`astro`),
    isFile: true,
  },
  ts: {
    text: "TypeScript",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`ts`),
    isFile: true,
  },
  python: {
    text: "Python",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`python`),
    isFile: true,
  },
  java: {
    text: "Java",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`java`),
    isFile: true,
  },
  oracle_jet: {
    text: "Oracle Jet",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`oracle_jet`),
    isFile: true,
  },
  oracle_infrastructure: {
    text: "Oracle Infrastructure",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`oracle_infrastructure`),
    isFile: true,
  },
  docker: {
    text: "Docker",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`docker`),
    isFile: true,
  },
  git: {
    text: "Git",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`git`),
  },
  jenkins: {
    text: "Jenkins",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`jenkins`),
  },
  jira: {
    text: "Jira",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`jira`),
  },
  fastapi: {
    text: "FastAPI",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`fastapi`),
  },
  preact: {
    text: "Preact",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`preact`),
  },
  oracle_apex: {
    text: "Oracle Apex",
    viewBox: "0 0 128 128",
    content: get_content_from_file(`oracle_apex`),
  },
};

export const ui: Record<string, Icon> = {
  sun: {
    text: "sun",
    viewBox: "0 0 24 24",
    content: `<path d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" ></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25ZM3.66865 3.71609C3.94815 3.41039 4.42255 3.38915 4.72825 3.66865L6.95026 5.70024C7.25596 5.97974 7.2772 6.45413 6.9977 6.75983C6.7182 7.06553 6.2438 7.08677 5.9381 6.80727L3.71609 4.77569C3.41039 4.49619 3.38915 4.02179 3.66865 3.71609ZM20.3314 3.71609C20.6109 4.02179 20.5896 4.49619 20.2839 4.77569L18.0619 6.80727C17.7562 7.08677 17.2818 7.06553 17.0023 6.75983C16.7228 6.45413 16.744 5.97974 17.0497 5.70024L19.2718 3.66865C19.5775 3.38915 20.0518 3.41039 20.3314 3.71609ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12ZM17.0255 17.0252C17.3184 16.7323 17.7933 16.7323 18.0862 17.0252L20.3082 19.2475C20.6011 19.5404 20.601 20.0153 20.3081 20.3082C20.0152 20.6011 19.5403 20.601 19.2475 20.3081L17.0255 18.0858C16.7326 17.7929 16.7326 17.3181 17.0255 17.0252ZM6.97467 17.0253C7.26756 17.3182 7.26756 17.7931 6.97467 18.086L4.75244 20.3082C4.45955 20.6011 3.98468 20.6011 3.69178 20.3082C3.39889 20.0153 3.39889 19.5404 3.69178 19.2476L5.91401 17.0253C6.2069 16.7324 6.68177 16.7324 6.97467 17.0253ZM12 19.25C12.4142 19.25 12.75 19.5858 12.75 20V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20C11.25 19.5858 11.5858 19.25 12 19.25Z" ></path>`,
  },
  moon: {
    text: "moon",
    viewBox: "0 0 24 24",
    content: `<path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>`,
  },
  folder: {
    text: "Folder",
    viewBox: "0 0 24 24",
    content: `<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />`,
    strokeWidth: 2,
  },
  arrowUpRight: {
    text: "External Link",
    viewBox: "0 0 24 24",
    content: `<line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>`,
    strokeWidth: 2,
  },
  menu: {
    text: "Open Navigation Menu",
    viewBox: "0 0 24 24",
    content: `<path d="M4 6h16M4 12h16M4 18h16"></path>`,
    strokeWidth: 2,
  },
  calendar: {
    text: "Date",
    viewBox: " 0 0 20 20",
    content: `<path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd"></path>`,
  },
  tag: {
    text: "Tag",
    viewBox: " 0 0 20 20",
    content: `
    <path fill-rule="evenodd" d="M4.5 2A2.5 2.5 0 002 4.5v3.879a2.5 2.5 0 00.732 1.767l7.5 7.5a2.5 2.5 0 003.536 0l3.878-3.878a2.5 2.5 0 000-3.536l-7.5-7.5A2.5 2.5 0 008.38 2H4.5zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />`,
  },
  arrowLeft: {
    text: "Back",
    viewBox: "0 0 24 24",
    content: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />`,
  },
  clock: {
    text: "Clock",
    viewBox: "0 0 24 24",
    content: `
      <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 13H12V8" />
        <path d="M5 3.5L7 2" />
        <path d="M19 3.5L17 2" />
        <path d="M12 22C16.9706 22 21 17.9706 21 13C21 8.02944 16.9706 4 12 4C7.02944 4 3 8.02944 3 13C3 17.9706 7.02944 22 12 22Z" />
      </g>`,
  },
  toggleLeft: {
    text: "",
    viewBox: "0 0 24 24",
    content: `<path d="m15 18-6-6 6-6"></path>`,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  toggleRight: {
    text: "",
    viewBox: "0 0 24 24",
    content: `<path d="m15 18-6-6 6-6"></path>`,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  vault: {
    text: "vault",
    viewBox: "0 0 24 24",
    content: `<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />`,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
    stroke: "currentColor",
    width: 16,
    height: 16,
  },
  onThisPage: {
    text: "On This Page",
    viewBox: "0 0 24 24",
    content: `<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>`,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
    stroke: "currentColor",
    width: 16,
    height: 16,
  },
  link: {
    text: "Link",
    viewBox: "0 0 24 24",
    content: `
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  `,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  check: {
    text: "Copied",
    viewBox: "0 0 24 24",
    content: `<path d="M20 6 9 17l-5-5" />`,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
};

export const social: Record<string, Icon> = {
  linked_in: {
    text: "LinkedIn",
    viewBox: "0 0 128 128",
    content: `<path d="M116 3H12a8.91 8.91 0 00-9 8.8v104.42a8.91 8.91 0 009 8.78h104a8.93 8.93 0 009-8.81V11.77A8.93 8.93 0 00116 3zM39.17 107H21.06V48.73h18.11zm-9-66.21a10.5 10.5 0 1110.49-10.5 10.5 10.5 0 01-10.54 10.48zM107 107H88.89V78.65c0-6.75-.12-15.44-9.41-15.44s-10.87 7.36-10.87 15V107H50.53V48.73h17.36v8h.24c2.42-4.58 8.32-9.41 17.13-9.41C103.6 47.28 107 59.35 107 75z"></path>`,
  },
  github: {
    text: "GitHub",
    viewBox: "0 0 128 128",
    content: `<path fill-rule="evenodd" clip-rule="evenodd" d="M64 5.103c-33.347 0-60.388 27.035-60.388 60.388 0 26.682 17.303 49.317 41.297 57.303 3.017.56 4.125-1.31 4.125-2.905 0-1.44-.056-6.197-.082-11.243-16.8 3.653-20.345-7.125-20.345-7.125-2.747-6.98-6.705-8.836-6.705-8.836-5.48-3.748.413-3.67.413-3.67 6.063.425 9.257 6.223 9.257 6.223 5.386 9.23 14.127 6.562 17.573 5.02.542-3.903 2.107-6.568 3.834-8.076-13.413-1.525-27.514-6.704-27.514-29.843 0-6.593 2.36-11.98 6.223-16.21-.628-1.52-2.695-7.662.584-15.98 0 0 5.07-1.623 16.61 6.19C53.7 35 58.867 34.327 64 34.304c5.13.023 10.3.694 15.127 2.033 11.526-7.813 16.59-6.19 16.59-6.19 3.287 8.317 1.22 14.46.593 15.98 3.872 4.23 6.215 9.617 6.215 16.21 0 23.194-14.127 28.3-27.574 29.796 2.167 1.874 4.097 5.55 4.097 11.183 0 8.08-.07 14.583-.07 16.572 0 1.607 1.088 3.49 4.148 2.897 23.98-7.994 41.263-30.622 41.263-57.294C124.388 32.14 97.35 5.104 64 5.104z"></path><path d="M26.484 91.806c-.133.3-.605.39-1.035.185-.44-.196-.685-.605-.543-.906.13-.31.603-.395 1.04-.188.44.197.69.61.537.91zm2.446 2.729c-.287.267-.85.143-1.232-.28-.396-.42-.47-.983-.177-1.254.298-.266.844-.14 1.24.28.394.426.472.984.17 1.255zM31.312 98.012c-.37.258-.976.017-1.35-.52-.37-.538-.37-1.183.01-1.44.373-.258.97-.025 1.35.507.368.545.368 1.19-.01 1.452zm3.261 3.361c-.33.365-1.036.267-1.552-.23-.527-.487-.674-1.18-.343-1.544.336-.366 1.045-.264 1.564.23.527.486.686 1.18.333 1.543zm4.5 1.951c-.147.473-.825.688-1.51.486-.683-.207-1.13-.76-.99-1.238.14-.477.823-.7 1.512-.485.683.206 1.13.756.988 1.237zm4.943.361c.017.498-.563.91-1.28.92-.723.017-1.308-.387-1.315-.877 0-.503.568-.91 1.29-.924.717-.013 1.306.387 1.306.88zm4.598-.782c.086.485-.413.984-1.126 1.117-.7.13-1.35-.172-1.44-.653-.086-.498.422-.997 1.122-1.126.714-.123 1.354.17 1.444.663zm0 0"></path>`,
  },
};
