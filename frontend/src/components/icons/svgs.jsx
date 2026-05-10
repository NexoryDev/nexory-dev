import {
  StarIcon,
  RepoForkedIcon,
  IssueOpenedIcon,
  RepoIcon,
  PersonIcon,
  GearIcon,
  ProjectIcon,
  TrophyIcon
} from '@primer/octicons-react';

const ICON_SIZE = 16;

const STAR_COLOR = '#fbbf24';
const FORK_COLOR = '#79c0ff';
const ISSUE_COLOR = '#ef4444';

export function SvgStar(props) {
  return <StarIcon size={ICON_SIZE} color={STAR_COLOR} {...props} />;
}

export function SvgFork(props) {
  return <RepoForkedIcon size={ICON_SIZE} color={FORK_COLOR} {...props} />;
}

export function SvgOpenIssue(props) {
  return <IssueOpenedIcon size={ICON_SIZE} color={ISSUE_COLOR} {...props} />;
}

export const SvgIssue = SvgOpenIssue;

export function SvgRepo(props) {
  return <RepoIcon size={ICON_SIZE} {...props} />;
}

export function SvgProfile(props) {
  return <PersonIcon size={ICON_SIZE} {...props} />;
}

export function SvgSettings(props) {
  return <GearIcon size={ICON_SIZE} {...props} />;
}

export function SvgProducts(props) {
  return <ProjectIcon size={ICON_SIZE} {...props} />;
}

export function SvgBadges(props) {
  return <TrophyIcon size={ICON_SIZE} {...props} />;
}