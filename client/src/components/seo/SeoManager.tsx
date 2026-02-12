import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type SeoConfig = {
  title: string;
  description: string;
  robots?: string;
};

const SITE_NAME = 'Jayness Foundation';
const DEFAULT_DESCRIPTION =
  'Jayness Foundation empowers communities through education, healthcare, and sustainable development programs.';

const ROUTE_SEO: Array<{ match: (path: string) => boolean; config: SeoConfig }> = [
  {
    match: (path) => path === '/',
    config: {
      title: `${SITE_NAME} | Community Impact`,
      description: DEFAULT_DESCRIPTION,
    },
  },
  {
    match: (path) => path === '/about',
    config: {
      title: `About Us | ${SITE_NAME}`,
      description: 'Learn about Jayness Foundation mission, values, and community-driven programs.',
    },
  },
  {
    match: (path) => path === '/contact',
    config: {
      title: `Contact | ${SITE_NAME}`,
      description: 'Contact Jayness Foundation for partnerships, support, and community collaboration.',
    },
  },
  {
    match: (path) => path === '/impact',
    config: {
      title: `Impact Stories | ${SITE_NAME}`,
      description: 'See how Jayness Foundation programs change lives through measurable community impact.',
    },
  },
  {
    match: (path) => path === '/join',
    config: {
      title: `Join Us | ${SITE_NAME}`,
      description: 'Join Jayness Foundation as a member, volunteer, donor, or beneficiary.',
    },
  },
  {
    match: (path) => path === '/public/programs',
    config: {
      title: `Programs | ${SITE_NAME}`,
      description: 'Explore active Jayness Foundation programs and community development initiatives.',
    },
  },
  {
    match: (path) => path.startsWith('/public/programs/'),
    config: {
      title: `Program Details | ${SITE_NAME}`,
      description: 'View details of this Jayness Foundation program and support the initiative.',
    },
  },
  {
    match: (path) => path === '/public/events',
    config: {
      title: `Events | ${SITE_NAME}`,
      description: 'Discover upcoming Jayness Foundation events and community activities.',
    },
  },
  {
    match: (path) => path.startsWith('/public/events/'),
    config: {
      title: `Event Details | ${SITE_NAME}`,
      description: 'View event details and participate in Jayness Foundation activities.',
    },
  },
  {
    match: (path) => path === '/login',
    config: {
      title: `Login | ${SITE_NAME}`,
      description: 'Access your Jayness Foundation member dashboard.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (path) => path === '/register',
    config: {
      title: `Register | ${SITE_NAME}`,
      description: 'Create an account to participate in Jayness Foundation programs.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (path) => path.startsWith('/forgot-password') || path.startsWith('/reset-password'),
    config: {
      title: `Account Recovery | ${SITE_NAME}`,
      description: 'Securely recover your Jayness Foundation account.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (path) => path.startsWith('/dashboard') || path.startsWith('/admin'),
    config: {
      title: `Member Dashboard | ${SITE_NAME}`,
      description: 'Private member and administration area.',
      robots: 'noindex, nofollow',
    },
  },
];

const upsertMetaByName = (name: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertMetaByProperty = (property: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertCanonical = (href: string) => {
  let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
};

const SeoManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const selected =
      ROUTE_SEO.find((entry) => entry.match(pathname))?.config ??
      ({
        title: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
      } as SeoConfig);

    const url = `${window.location.origin}${pathname}`;
    const robots = selected.robots ?? 'index, follow';

    document.title = selected.title;
    upsertMetaByName('description', selected.description);
    upsertMetaByName('robots', robots);
    upsertMetaByProperty('og:title', selected.title);
    upsertMetaByProperty('og:description', selected.description);
    upsertMetaByProperty('og:url', url);
    upsertMetaByProperty('og:type', 'website');
    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', selected.title);
    upsertMetaByName('twitter:description', selected.description);
    upsertCanonical(url);
  }, [pathname]);

  return null;
};

export default SeoManager;

