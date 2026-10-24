import React from 'react';
import { ExternalLink } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import LuxuryImage from './common/LuxuryImage';

export default function InstagramCTA() {
  // Editorial Instagram preview grid
  const instaPreviews = [
    {
      id: 1,
      image: '/gallery/acrylic-xl-set.jpg',
      caption: 'Extra-long acrylic set with custom sculpted details',
      postUrl: 'https://www.instagram.com/resplandor.atl/p/DZA1fR4kXkM/',
    },
    {
      id: 2,
      image: '/gallery/soft-gel-3d-art.jpg',
      caption: 'Soft gel set with handmade 3D gel art',
      postUrl: 'https://www.instagram.com/resplandor.atl/p/DYI6xHIDXoW/',
    },
    {
      id: 3,
      image: '/gallery/polygel-natural-overlay.jpg',
      caption: 'Spring polygel overlay on natural nails',
      postUrl: 'https://www.instagram.com/resplandor.atl/p/DYA5tDRDXcV/',
    },
    {
      id: 4,
      image: '/gallery/soft-gel-spring-3d-art.jpg',
      caption: 'Spring soft gel set with 3D details',
      postUrl: 'https://www.instagram.com/resplandor.atl/p/DW7IDPfkRFp/',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-cream-100/70 border-t border-b border-blush-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main CTA Box */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blush-200/80 border border-blush-300 text-burgundy-950 text-xs font-semibold tracking-wide-luxury uppercase mb-4">
            <InstagramIcon className="w-3.5 h-3.5 text-rosegold-600" />
            <span>@resplandor.atl</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-burgundy-950 tracking-tight mb-4">
            Get Inspired. Stay Connected.
          </h2>

          <p className="text-base text-burgundy-900/80 leading-relaxed mb-8">
            Discover more nail designs and follow Resplandor ATL on Instagram.
          </p>

          <a
            href="https://www.instagram.com/resplandor.atl/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs uppercase tracking-luxury font-semibold text-cream-50 bg-burgundy-950 hover:bg-burgundy-800 shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <InstagramIcon className="w-4 h-4 text-rosegold-300 group-hover:rotate-12 transition-transform" />
            <span>Follow on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 text-cream-200" />
          </a>
        </div>

        {/* Visual Instagram Feed Teaser Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {instaPreviews.map((post) => (
            <a
              key={post.id}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl overflow-hidden aspect-square bg-cream-200 border border-blush-200/80 shadow-sm block"
            >
              <LuxuryImage
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                loading="lazy"
                fallbackTitle="Instagram Set"
              />
              <div className="absolute inset-0 bg-burgundy-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-cream-50">
                <div className="flex justify-end">
                  <InstagramIcon className="w-4 h-4 text-rosegold-300" />
                </div>
                <div>
                  <p className="text-xs font-sans line-clamp-2 text-cream-100 mb-1">
                    {post.caption}
                  </p>
                  <span className="text-[10px] tracking-wider text-rosegold-300 font-medium uppercase">
                    @resplandor.atl
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
