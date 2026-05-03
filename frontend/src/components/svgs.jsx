import { StarIcon, RepoForkedIcon, IssueOpenedIcon, RepoIcon, PersonIcon, GearIcon, ProjectIcon } from '@primer/octicons-react';

const ICON_SIZE = 16;
const STAR_COLOR = '#fbbf24';
const ISSUE_COLOR = '#ef4444';

export function SvgStar(props) {
  return <StarIcon size={ICON_SIZE} fill={STAR_COLOR} {...props} />;
}

export function SvgFork(props) {
  return <RepoForkedIcon size={ICON_SIZE} {...props} />;
}

export function SvgOpenIssue(props) {
  return <IssueOpenedIcon size={ICON_SIZE} fill={ISSUE_COLOR} {...props} />;
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
