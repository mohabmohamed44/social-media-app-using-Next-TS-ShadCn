import Link from "next/link";
import { Poppins } from 'next/font/google';

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface FooterProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const poppins = Poppins({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
  })

export default function Footer({
  logo = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg",
    alt: "blocks for shadcn/ui",
    title: "LinkedPosts",
    url: "/",
  },
  tagline = "About Connection",
  menuItems = [
    {
      title: "LinkedPosts",
      links: [
        { text: "Posts", url: "/post" },
        { text: "Create", url: "/post/new" },
      ],
    },
    {
      title: "Social Media",
      links: [
        { text: "Facebook", url: "https://facebook.com" },
        { text: "Instagram", url: "https://instagram.com" },
        { text: "Twitter", url: "https://twitter.com" },
      ],
    },
  ],
}: FooterProps) {
  return (
    <section className={`py-32 ${poppins.className}`}>
      <div className="container">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
            <div className="col-span-2 mb-8 p-8 lg:mb-0">
              <div className="flex items-center gap-2 lg:justify-start">
                <Link href={logo.url}>
                  <p className="text-xl font-semibold">{logo.title}</p>
                </Link>
              </div>
              <p className="mt-4 font-bold">{tagline}</p>
            </div>

            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx} className="p-6">
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="space-y-4 text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary"
                    >
                      {link.url.startsWith("http") ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.text}
                        </a>
                      ) : (
                        <Link href={link.url}>{link.text}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </section>
  );
}
