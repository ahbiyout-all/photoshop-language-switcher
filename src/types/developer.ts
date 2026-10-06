// Official developer and organization metadata
import {
  APP_AUTHOR,
  APP_GITHUB_PROFILE,
  APP_GITHUB_DISPLAY_NAME,
  APP_OFFICIAL_BLOG,
  APP_ORGANIZATION_URL,
} from '../version';

export interface DeveloperProfile {
  name: string;
  githubUrl: string;
  githubDisplayName: string;
  officialBlogUrl: string;
  organizationName: string;
  organizationUrl: string;
}

export const OFFICIAL_DEVELOPER_INFO: DeveloperProfile = {
  name: APP_AUTHOR,
  githubUrl: APP_GITHUB_PROFILE,
  githubDisplayName: APP_GITHUB_DISPLAY_NAME,
  officialBlogUrl: APP_OFFICIAL_BLOG,
  organizationName: 'CIS',
  organizationUrl: APP_ORGANIZATION_URL,
};
