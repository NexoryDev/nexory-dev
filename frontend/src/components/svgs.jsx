import { StarIcon, RepoForkedIcon, IssueOpenedIcon, RepoIcon } from '@primer/octicons-react';

export function SvgStar(props) {
  return <StarIcon size={16} {...props} />;
}

export function SvgFork(props) {
  return <RepoForkedIcon size={16} {...props} />;
}

export function SvgOpenIssue(props) {
  return <IssueOpenedIcon size={16} {...props} />;
}

export function SvgIssue(props) {
  return <IssueOpenedIcon size={16} {...props} />;
}

export function SvgRepo(props) {
  return <RepoIcon size={16} {...props} />;
}