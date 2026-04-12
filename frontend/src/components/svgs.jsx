import { StarIcon, RepoForkedIcon, IssueOpenedIcon, RepoIcon } from '@primer/octicons-react';

const ICON_SIZE = 16;

export function SvgStar(props) {
  return <StarIcon size={ICON_SIZE} {...props} />;
}

export function SvgFork(props) {
  return <RepoForkedIcon size={ICON_SIZE} {...props} />;
}

export function SvgOpenIssue(props) {
  return <IssueOpenedIcon size={ICON_SIZE} {...props} />;
}

export const SvgIssue = SvgOpenIssue;

export function SvgRepo(props) {
  return <RepoIcon size={ICON_SIZE} {...props} />;
}