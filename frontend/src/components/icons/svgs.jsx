import {
  GearIcon,
  IssueOpenedIcon,
  PersonIcon,
  ProjectIcon,
  RepoForkedIcon,
  StarIcon,
  TrophyIcon,
  CreditCardIcon,
  PackageIcon
} from "@primer/octicons-react";

const ICON_SIZE = 16;
const ICON_COLOR = "#9babbc";

export const SERVICE_ICON_PATHS = {
  discord: [
    "M7.2 9.2c.4-2.6 2.2-4.1 4.8-4.1s4.4 1.5 4.8 4.1",
    "M8.4 5.8 7.2 3.7",
    "m15.6 5.8 1.2-2.1",
    "M7.3 8.2h9.4a3.1 3.1 0 0 1 3.1 3.1v5.2a3.1 3.1 0 0 1-3.1 3.1H7.3a3.1 3.1 0 0 1-3.1-3.1v-5.2a3.1 3.1 0 0 1 3.1-3.1Z",
    "M8.1 15.8c1.1.8 2.4 1.2 3.9 1.2s2.8-.4 3.9-1.2",
    "M9.1 12.7h.01",
    "M14.9 12.7h.01",
    "M3 13.1H1.7",
    "M22.3 13.1H21",
  ],
  web: [
    "M5.6 4.4h12.8a2.4 2.4 0 0 1 2.4 2.4v9.6a2.4 2.4 0 0 1-2.4 2.4H5.6a2.4 2.4 0 0 1-2.4-2.4V6.8a2.4 2.4 0 0 1 2.4-2.4Z",
    "M3.2 8.2h17.6",
    "m9.4 12-2.1 2.1 2.1 2.1",
    "m14.6 12 2.1 2.1-2.1 2.1",
    "m12.9 11.6-1.8 4.8",
    "M6.4 6.35h.01",
    "M8.8 6.35h.01",
  ],
  app: [
    "M9.3 2.8h5.4a2.2 2.2 0 0 1 2.2 2.2v14a2.2 2.2 0 0 1-2.2 2.2H9.3A2.2 2.2 0 0 1 7.1 19V5a2.2 2.2 0 0 1 2.2-2.2Z",
    "M10.2 5h3.6",
    "M11.2 18.4h1.6",
    "M9.6 9.1h4.8",
    "M9.6 12h4.8",
    "M9.6 14.9h2.2",
  ],
  individual: [
    "M12 3.2v3",
    "M12 17.8v3",
    "M3.2 12h3",
    "M17.8 12h3",
    "M15.7 12a3.7 3.7 0 1 1-7.4 0 3.7 3.7 0 0 1 7.4 0Z",
    "M6.3 6.3 8.4 8.4",
    "m15.6 15.6 2.1 2.1",
    "m17.7 6.3-2.1 2.1",
    "m8.4 15.6-2.1 2.1",
    "M12 10.4v3.2",
    "M10.4 12h3.2",
  ],
};

export const SvgStar = () => <StarIcon size={ICON_SIZE} color={ICON_COLOR} />;
export const SvgFork = () => <RepoForkedIcon size={ICON_SIZE} color={ICON_COLOR} />;
export const SvgOpenIssue = () => <IssueOpenedIcon size={ICON_SIZE} color={ICON_COLOR} />;
export const SvgProfile = () => <PersonIcon size={ICON_SIZE} color={ICON_COLOR} />;
export const SvgSettings = () => <GearIcon size={ICON_SIZE} color={ICON_COLOR} />;
export const SvgProducts = () => <ProjectIcon size={ICON_SIZE} color={ICON_COLOR} />;
export const SvgBadges = () => <TrophyIcon size={ICON_SIZE} color={ICON_COLOR} />;
export const SvgBilling = () => <CreditCardIcon size={ICON_SIZE} color={ICON_COLOR} />;
export const SvgOrders = () => <PackageIcon size={ICON_SIZE} color={ICON_COLOR} />;

function ServiceSvg({ children, size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SvgDiscordBot(props) {
  return (
    <ServiceSvg {...props}>
      {SERVICE_ICON_PATHS.discord.map((path) => <path key={path} d={path} />)}
    </ServiceSvg>
  );
}

export function SvgWebDevelopment(props) {
  return (
    <ServiceSvg {...props}>
      {SERVICE_ICON_PATHS.web.map((path) => <path key={path} d={path} />)}
    </ServiceSvg>
  );
}

export function SvgAppDevelopment(props) {
  return (
    <ServiceSvg {...props}>
      {SERVICE_ICON_PATHS.app.map((path) => <path key={path} d={path} />)}
    </ServiceSvg>
  );
}

export function SvgIndividualSolutions(props) {
  return (
    <ServiceSvg {...props}>
      {SERVICE_ICON_PATHS.individual.map((path) => <path key={path} d={path} />)}
    </ServiceSvg>
  );
}

export function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" {...props}>
      <path
        d="M12 5c-5 0-8.5 4.5-9.4 6.1a1.8 1.8 0 0 0 0 1.8C3.5 14.5 7 19 12 19s8.5-4.5 9.4-6.1a1.8 1.8 0 0 0 0-1.8C20.5 9.5 17 5 12 5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function IconEyeOff(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" {...props}>
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.4 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.4 6.1a1.8 1.8 0 0 1 0 1.8 17 17 0 0 1-2.2 2.8M6.2 6.7A17.5 17.5 0 0 0 2.6 11a1.8 1.8 0 0 0 0 1.8C3.5 14.5 7 19 12 19a10.4 10.4 0 0 0 4.1-.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
